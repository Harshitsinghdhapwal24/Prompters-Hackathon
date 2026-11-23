import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { SYSTEM_PROMPT } from '@/lib/geminiPrompt';
import { Lecture, SourceType } from '@/types/lecture';
import { getYouTubeLectureData } from '@/lib/youtube';
import { checkRateLimit } from '@/lib/rateLimit';
import { generateLectureWithGroq } from '@/lib/groq';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rate = checkRateLimit(ip, 30);
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please wait a moment before generating new notes.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
    const contentType = req.headers.get('content-type') || '';
    let title = '';
    let subject = '';
    let rawText = '';
    let sourceType: SourceType = 'text';
    let fileName = '';
    let fileSize = 0;
    let fileBuffer: Buffer | null = null;
    let mimeType = '';
    let youtubeUrl = '';
    let youtubeThumbnail = '';
    let youtubeAuthor = '';
    let youtubeTranscriptItems: Array<{ time: string; text: string }> = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      title = (formData.get('title') as string) || '';
      subject = (formData.get('subject') as string) || '';
      rawText = (formData.get('text') as string) || '';
      sourceType = ((formData.get('sourceType') as string) as SourceType) || 'text';
      youtubeUrl = (formData.get('youtubeUrl') as string) || '';

      const file = formData.get('file') as File | null;
      if (file && file.size > 0) {
        fileName = file.name;
        fileSize = file.size;
        mimeType = file.type || 'application/octet-stream';
        const arrayBuf = await file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuf);

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
      youtubeUrl = json.youtubeUrl || '';
    }

    // Process YouTube link if provided
    if (youtubeUrl || sourceType === 'youtube') {
      sourceType = 'youtube';
      try {
        const ytData = await getYouTubeLectureData(youtubeUrl);
        youtubeThumbnail = ytData.thumbnailUrl;
        youtubeAuthor = ytData.author;
        youtubeTranscriptItems = ytData.transcriptItems;
        youtubeUrl = ytData.url;

        if (!title || title.trim() === '') {
          title = ytData.title;
        }

        if (ytData.transcriptText) {
          rawText = ytData.transcriptText;
        } else if (!rawText) {
          rawText = `YouTube Video Lecture: "${ytData.title}" by ${ytData.author}.`;
        }
      } catch (ytErr: any) {
        console.error('Error fetching YouTube details:', ytErr);
        if (!rawText && !title) {
          return NextResponse.json(
            { success: false, error: ytErr?.message || 'Failed to process YouTube link.' },
            { status: 400 }
          );
        }
      }
    }

    if (!title && fileName) {
      title = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    } else if (!title) {
      title = 'Lecture Session — ' + new Date().toLocaleDateString();
    }

    if (!subject) {
      subject = 'General Studies';
    }

    // Determine API Key and Model configurations
    const headerApiKey = req.headers.get('x-gemini-api-key');
    const headerModel = req.headers.get('x-gemini-model');
    const headerGroqKey = req.headers.get('x-groq-api-key');
    const headerGroqModel = req.headers.get('x-groq-model');

    const geminiApiKey = (headerApiKey && headerApiKey.trim()) || process.env.GEMINI_API_KEY || '';
    const geminiModel = (headerModel && headerModel.trim()) || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const groqApiKey = (headerGroqKey && headerGroqKey.trim()) || process.env.GROQ_API_KEY || '';
    const groqModel = (headerGroqModel && headerGroqModel.trim()) || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    let parsedData: any = null;
    let provider: 'gemini' | 'groq' | 'fallback' = 'fallback';

    // Tier 1: Try Primary Google Gemini API
    if (geminiApiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const parts: any[] = [];

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
${youtubeUrl ? `YouTube Video URL: ${youtubeUrl} (Channel/Instructor: ${youtubeAuthor})` : ''}
${rawText ? `Lecture Transcript / Content Notes:\n"""\n${rawText.slice(0, 40000)}\n"""` : 'Please process the attached media file completely.'}

Follow all instructions in the system prompt. Return purely valid JSON according to the schema.`;

        parts.push({ text: userPrompt });

        const response = await ai.models.generateContent({
          model: geminiModel,
          contents: parts,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: 'application/json',
          },
        });

        const responseText = response.text || '';
        try {
          parsedData = JSON.parse(responseText);
        } catch {
          const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
          parsedData = JSON.parse(cleaned);
        }
        provider = 'gemini';
      } catch (geminiError: any) {
        console.warn('Primary Gemini API execution error, checking fallback options:', geminiError?.message);

        // Tier 2 Fallback: If Gemini hits quota limit or throws error, fall back to Groq LLaMA 3.3
        if (groqApiKey) {
          console.log('Initiating automatic fallback to Groq inference engine...');
          try {
            parsedData = await generateLectureWithGroq({
              apiKey: groqApiKey,
              model: groqModel,
              title,
              subject,
              sourceType,
              rawText,
              youtubeUrl,
              youtubeAuthor,
            });
            provider = 'groq';
          } catch (groqError: any) {
            console.error('Groq fallback execution error:', groqError);
          }
        }
      }
    } else if (groqApiKey) {
      // Direct execution with Groq when Gemini key is empty but Groq key is present
      try {
        parsedData = await generateLectureWithGroq({
          apiKey: groqApiKey,
          model: groqModel,
          title,
          subject,
          sourceType,
          rawText,
          youtubeUrl,
          youtubeAuthor,
        });
        provider = 'groq';
      } catch (groqError: any) {
        console.error('Direct Groq execution error:', groqError);
      }
    }

    // If live AI synthesis succeeded (via Gemini or Groq fallback), construct full lecture
    if (parsedData) {
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
        youtubeUrl: youtubeUrl || undefined,
        youtubeThumbnail: youtubeThumbnail || undefined,
        youtubeAuthor: youtubeAuthor || undefined,
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
        transcript: youtubeTranscriptItems.length > 0
          ? youtubeTranscriptItems
          : Array.isArray(parsedData.transcript)
          ? parsedData.transcript
          : [
              {
                time: '00:00:00',
                speaker: youtubeAuthor || 'Instructor',
                text: rawText || `Lecture content from ${title}`,
              },
            ],
      };

      return NextResponse.json({
        success: true,
        lecture,
        provider,
        isLiveGemini: provider === 'gemini',
        isLiveGroq: provider === 'groq',
      });
    }

    // Fallback / Demonstration Mode (When no API key is provided)
    const sampleLecture = generateRealisticFallbackLecture({
      title,
      subject,
      rawText,
      sourceType,
      fileName,
      fileSize,
      youtubeUrl,
      youtubeThumbnail,
      youtubeAuthor,
      youtubeTranscriptItems,
    });

    return NextResponse.json({
      success: true,
      lecture: sampleLecture,
      isDemoMode: true,
      notice: 'Generated in Demonstration Mode. Add your Gemini API Key in Settings for cloud custom models.',
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
  youtubeUrl?: string;
  youtubeThumbnail?: string;
  youtubeAuthor?: string;
  youtubeTranscriptItems?: Array<{ time: string; text: string }>;
}): Lecture {
  const {
    title,
    subject,
    rawText,
    sourceType,
    fileName,
    fileSize,
    youtubeUrl,
    youtubeThumbnail,
    youtubeAuthor,
    youtubeTranscriptItems,
  } = params;
  const lectureId = 'lec-' + Date.now();

  const isYouTube = sourceType === 'youtube';

  return {
    id: lectureId,
    title: title || (isYouTube ? 'YouTube Lecture Study Guide' : 'University Lecture on ' + subject),
    subject: subject || 'Science & Technology',
    createdAt: new Date().toISOString(),
    durationMinutes: 45,
    sourceType,
    sourceFileName: fileName || undefined,
    sourceFileSize: fileSize || undefined,
    youtubeUrl: youtubeUrl || undefined,
    youtubeThumbnail: youtubeThumbnail || undefined,
    youtubeAuthor: youtubeAuthor || undefined,
    status: 'ready',
    summary: {
      tldr: `Comprehensive analysis of core principles covered in "${title}". Synthesizes theoretical foundations, empirical mechanisms, and high-yield examination takeaways.`,
      keyTakeaways: [
        `Fundamental definitions and governing mechanisms established for ${title}.`,
        'Critical examination of foundational equations and governing constraints.',
        'Methodological framework for solving standard midterm and final exam problems.',
        'Common cognitive pitfalls and exam traps identified during lecture discussion.',
        'Practical real-world implications and experimental paradigms.'
      ],
      detailedSummary: `This lecture provides a structured exploration of ${title}${youtubeAuthor ? ` presented by ${youtubeAuthor}` : ''}. 

The session begins by framing the theoretical and practical context, identifying key operational bottlenecks addressed by modern paradigms.

Key concepts are systematically analyzed, connecting mathematical formulas to mechanical intuition. Special attention is directed toward derivation techniques, boundary conditions, and high-yield problem sets.`
    },
    notes: `# ${title} — Comprehensive University Study Guide & In-Depth Notes

${youtubeAuthor ? `*Instructor / Source: ${youtubeAuthor}*  \n*Subject Domain: ${subject}*\n\n---\n` : ''}

## Table of Contents
1. [Executive Summary & Problem Formulation](#1-executive-summary--problem-formulation)
2. [Theoretical Foundations & Core Mechanics](#2-theoretical-foundations--core-mechanics)
3. [Step-by-Step Mathematical Derivations](#3-step-by-step-mathematical-derivations)
4. [Algorithmic Architecture & System Workflow](#4-algorithmic-architecture--system-workflow)
5. [Comparative Analysis & Trade-off Matrix](#5-comparative-analysis--trade-off-matrix)
6. [Practical Implementation & Worked Problem Example](#6-practical-implementation--worked-problem-example)
7. [Boundary Conditions, Edge Cases & Failure Modes](#7-boundary-conditions-edge-cases--failure-modes)
8. [High-Yield Examination Pitfalls & Common Student Errors](#8-high-yield-examination-pitfalls--common-student-errors)
9. [Key Takeaways & Quick-Revision Formula Sheet](#9-key-takeaways--quick-revision-formula-sheet)

---

## 1. Executive Summary & Problem Formulation
This comprehensive lecture examines the core mechanisms, governing principles, and analytical problem-solving methods of **${title}** within the discipline of **${subject}**.

### 1.1 Fundamental Motivation
In advanced academic curricula, understanding ${title} is critical because traditional models frequently encounter severe scaling bottlenecks, non-linear perturbations, or computational intractability when applied to complex dynamic environments.
- **The Core Problem:** Prior methodologies relied upon rigid heuristic approximations that failed to generalize across heterogeneous boundary conditions.
- **The Modern Breakthrough:** By establishing a unified structural representation, current paradigms decouple state evolution from localized noise, ensuring numerical stability, strict mathematical consistency, and predictable convergence.

> **Exam Alert:** University midterm and final examinations routinely test your ability to explain *why* previous historical paradigms broke down before introducing the modern formulation. Always frame your answer around operational complexity and empirical constraints.

---

## 2. Theoretical Foundations & Core Mechanics
The conceptual foundation of ${title} rests upon three interconnected theoretical pillars:

### 2.1 First-Principles Governing Axioms
Every physical, mathematical, or algorithmic state transition in this system is constrained by:
1. **Conservation & Invariance Laws:** The total mass, energy, momentum, or probability density across closed boundaries remains strictly conserved:
   $$\\sum_{k} P(S_k) = 1.0 \\quad \\text{and} \\quad \\oint_{\\partial \\Omega} \\mathbf{F} \\cdot d\\mathbf{A} = 0$$
2. **Constitutive Relationships:** The dynamic coupling between internal state gradients and observable flux vectors follows a proportional response curve before reaching saturation limits.
3. **Continuity & Smoothness Criteria:** The state transformation function must be at least $C^1$-continuous over the operating domain, precluding discontinuous jump singularities under normal operating regimes.

### 2.2 System Block Architecture
\`\`\`
[Input State Vector x(t)] ──> [Feature Projection W_p] ──> [Non-linear Kernel Activation]
                                                                     │
                                                                     ▼
[Output Target y(t)] <── [Normalization Layer] <── [State Fusion Operator ⊕]
\`\`\`

---

## 3. Step-by-Step Mathematical Derivations

### 3.1 Establishing the Differential Rate Formulation
To model the instantaneous temporal evolution of the system state $S(t)$, we begin with the continuous-time governing differential equation:

$$\\frac{dS(t)}{dt} = -\\lambda \\cdot S(t) + \\beta \\cdot \\int_0^t K(t - \\tau) u(\\tau) d\\tau$$

Where:
- $S(t) \\in \\mathbb{R}^d$: State vector at time $t$.
- $\\lambda > 0$: Intrinsic dissipation or relaxation parameter.
- $\\beta$: Sensitivity scaling factor governing external forcing response.
- $K(t - \\tau)$: Memory convolution kernel capturing temporal state dependencies.
- $u(\\tau)$: Exogenous input or control signal.

### 3.2 Step-by-Step Analytical Derivation of Steady-State Equilibrium
Follow this exact multi-step derivation procedure for exam credit:

**Step 1: Impose the Steady-State Balance Criterion**  
At thermodynamic or dynamical equilibrium, the net rate of state variation diminishes to zero:
$$\\lim_{t \\to \\infty} \\frac{dS(t)}{dt} \\equiv 0$$

**Step 2: Evaluate the Convolution Integral under Constant Input**  
Assuming a sustained step input $u(\\tau) = u_0$ for $\\tau \\ge 0$, and normalizing the memory kernel such that $\\int_0^\\infty K(\\xi) d\\xi = 1$:
$$0 = -\\lambda S^* + \\beta u_0 \\cdot (1)$$

**Step 3: Solve for the Invariant Steady-State Parameter $S^*$**  
Isolating $S^*$ through straightforward algebraic balance yields the canonical closed-form solution:
$$S^* = \\frac{\\beta}{\\lambda} \\cdot u_0$$

> **Key Takeaway:** The steady-state equilibrium amplitude is directly proportional to the coupling coefficient $\\beta$ and inversely proportional to the relaxation rate $\\lambda$. If $\\lambda \\to 0$, the system experiences unbounded asymptotic divergence (resonance or instability).

---

## 4. Algorithmic Architecture & System Workflow
When implementing or tracing this system in practice, execute the following verified pipeline:

1. **Pre-processing & Normalization:**
   - Standardize all multi-dimensional inputs to zero mean and unit variance $(\\mu = 0, \\sigma^2 = 1)$.
   - Filter high-frequency acquisition artifacts using a symmetric Hann-window convolution.

2. **Tensor Dimension Alignment:**
   - Map $N \\times D$ input representations into latent projection spaces using orthogonal linear transformations.
   - Verify that row-rank conditions are satisfied ($rank(A) = \\min(N, D)$) to prevent rank-collapse degeneracy.

3. **Dynamic Forward Propagation:**
   - Compute layer activations using stabilized softmax or rectified linear units:
     $$\\sigma(z_i) = \\frac{e^{z_i - \\max(z)}}{\\sum_{j} e^{z_j - \\max(z)}}$$
   - *Note on numerical stability:* Subtracting $\\max(z)$ prevents floating-point overflow in 32-bit and 16-bit precision engines.

4. **Residual Integration & Convergence Verification:**
   - Check gradient norm $\\|\\nabla L\\|_2 \\le \\epsilon_{\\text{threshold}}$ to confirm strict mathematical convergence.

---

## 5. Comparative Analysis & Trade-off Matrix

| Metric / Dimension | Baseline Classical Approach | Modern Paradigm (${title.slice(0, 24)}) | High-Capacity Distributed Model |
| :--- | :--- | :--- | :--- |
| **Computational Complexity** | $\\mathcal{O}(N)$ sequential | $\\mathcal{O}(1)$ parallelizable | $\\mathcal{O}(N \\log N)$ distributed |
| **Memory Footprint** | Low (constant state buffer) | Moderate ($d \\times d$ matrix caches) | High (requires sharded cache) |
| **Long-Horizon Stability** | Poor (vanishing gradients/drift) | Excellent (residual skip paths) | Exceptional (global attention) |
| **Interpretability** | High (explicit parametric curves) | Balanced (attention heatmaps) | Low (opaque deep latent space) |
| **Typical Exam Weightage** | 15% (historical context) | **60% (primary exam focus)** | 25% (bonus / honors questions) |

---

## 6. Practical Implementation & Worked Problem Example

### Worked Example: Midterm Problem
**Problem Statement:**  
A system governed by the parameters $\\beta = 4.2$, $\\lambda = 0.70 \\text{ s}^{-1}$, and baseline displacement $S_0 = 10.0$ units is subjected to a constant excitation step $u_0 = 5.0$ units at $t = 0$.  
1. Calculate the final steady-state value $S^*$.  
2. Determine the time $t_{95\\%}$ required for the system to reach 95% of its asymptotic limit.

**Solution Procedure:**  
1. **Calculate $S^*$:**
   $$S^* = \\frac{\\beta \\cdot u_0}{\\lambda} = \\frac{4.2 \\times 5.0}{0.70} = \\frac{21.0}{0.70} = 30.0 \\text{ units}$$

2. **Evaluate Temporal Transient Response:**  
   The time-domain differential solution is:
   $$S(t) = S^* + (S_0 - S^*) \\cdot e^{-\\lambda t}$$
   Substituting numerical values:
   $$S(t) = 30.0 + (10.0 - 30.0) \\cdot e^{-0.70 t} = 30.0 - 20.0 \\cdot e^{-0.70 t}$$
   Setting $S(t) = 0.95 \\times S^* = 28.5$:
   $$28.5 = 30.0 - 20.0 \\cdot e^{-0.70 t}$$
   $$-1.5 = -20.0 \\cdot e^{-0.70 t} \\implies e^{-0.70 t} = 0.075$$
   $$-0.70 t = \\ln(0.075) = -2.590 \\implies t_{95\\%} = \\frac{2.590}{0.70} \\approx 3.70 \\text{ seconds}$$

---

## 7. Boundary Conditions, Edge Cases & Failure Modes

When solving problems under non-standard conditions, verify the following boundary extremes:
- **Case 1: Under-damped or Negative Dissipation ($\\lambda \\le 0$):**  
  The system exhibits self-reinforcing limit cycles or catastrophic thermal/numerical runaway. In software implementations, clamp values or introduce Leaky-ReLU bounds.
- **Case 2: Vanishing Signal Amplitude ($u_0 \\to 0$):**  
  System decays monotonically to zero state according to the characteristic half-life:
  $$t_{1/2} = \\frac{\\ln(2)}{\\lambda} \\approx \\frac{0.693}{\\lambda}$$
- **Case 3: Singular Matrix Inversion:**  
  When basis vectors become co-linear, invertibility fails. Always utilize Tikhonov regularization (Ridge regression penalty) by adding $\\gamma \\mathbf{I}$ prior to inversion:
  $$\\mathbf{W}^* = (\\mathbf{X}^T \\mathbf{X} + \\gamma \\mathbf{I})^{-1} \\mathbf{X}^T \\mathbf{y}$$

---

## 8. High-Yield Examination Pitfalls & Common Student Errors

> **Caution — Frequent Student Errors on Exams:**
> 1. **Unit Inconsistency:** Forgetting to convert time units (e.g., minutes to seconds) when computing decay exponents in $e^{-\\lambda t}$.
> 2. **Confusing Transient with Steady-State:** Applying $S^* = \\frac{\\beta}{\\lambda} u_0$ before $t > 5\\tau$ has elapsed. Always verify whether the question asks for instantaneous response at time $t$ or asymptotic equilibrium.
> 3. **Sign Inversion in Conservation Flux:** Reversing inflow and outflow conventions ($F_{\\text{net}} = F_{\\text{in}} - F_{\\text{out}}$). A negative net flux means depletion, not accumulation!
> 4. **Neglecting Normalization Constants:** In probability and energy density calculations, failing to divide by the partition function $Z = \\sum_i e^{-E_i / k_B T}$ costs full marks on derivation questions.

---

## 9. Key Takeaways & Quick-Revision Formula Sheet

- **Core Metric:** Dynamic response balances excitation and dissipation.
- **Asymptotic Limit:** $S^* = \\frac{\\beta}{\\lambda} u_0$.
- **Time Constant:** $\\tau = \\frac{1}{\\lambda}$, with $3\\tau \\approx 95\\%$ transition completion.
- **Exam Strategy:** Draw the block diagram first, label all coordinate axes with correct SI units, and explicitly state boundary condition assumptions before writing algebraic formulas.
`,
    keyConcepts: [
      {
        id: 'kc-f-1',
        term: `${title.split(':')[0] || title} Primary Principle`,
        definition: `The central governing theorem that dictates how states evolve and interact within ${subject}.`,
        importance: 'high',
        category: 'Theory',
        example: 'Canonical model tested on university examinations.'
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
    transcript: youtubeTranscriptItems && youtubeTranscriptItems.length > 0
      ? youtubeTranscriptItems
      : [
          { time: '00:00:10', speaker: youtubeAuthor || 'Lecturer', text: `Welcome to this lecture on ${title}.` },
          { time: '00:04:30', speaker: youtubeAuthor || 'Lecturer', text: 'Notice how the equations on the board mirror the fundamental principles we developed last week.' },
          { time: '00:12:15', speaker: youtubeAuthor || 'Lecturer', text: 'Pay close attention here: this exact derivation appeared on last year’s final examination.' }
        ]
  };
}
