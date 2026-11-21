import { Lecture } from '@/types/lecture';

export const DEMO_LECTURES: Lecture[] = [
  {
    id: 'lec-cs-182',
    title: 'CS 182: Transformers, Attention Mechanisms & Deep Neural Backpropagation',
    subject: 'Computer Science',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    durationMinutes: 54,
    sourceType: 'audio',
    sourceFileName: 'cs182_lecture14_transformers.mp3',
    sourceFileSize: 48200000,
    status: 'ready',
    summary: {
      tldr: 'An in-depth derivation of multi-head self-attention, the Transformer encoder-decoder architecture, and how scaled dot-product attention solves the vanishing gradient bottleneck of recurrent neural networks.',
      keyTakeaways: [
        'Transformers eliminate sequential bottleneck in RNNs by processing tokens in parallel using positional encodings.',
        'Scaled dot-product attention scales query-key products by 1/√d_k to prevent gradient vanishing in the softmax function.',
        'Multi-Head Attention enables the network to jointly attend to information from different representation subspaces at different positions.',
        'Residual connections and Layer Normalization are strictly necessary for training deep networks (e.g., 96+ layers).',
        'Computational complexity is O(N² · d) for self-attention, making long-context optimization an active research domain.'
      ],
      detailedSummary: `This lecture explores the paradigm shift from Recurrent Neural Networks (RNNs) and LSTMs to the Transformer architecture introduced by Vaswani et al. (2017).

Professor covers the fundamental limitations of sequential recurrence: sequential dependencies prevent GPU parallelization across time steps, while information bottlenecks and vanishing/exploding gradients limit long-range dependency capture.

The core formulation of attention is presented as a soft lookup table: Queries (Q), Keys (K), and Values (V). By projecting embeddings into multiple subspace heads, the model learns syntactic, semantic, and coreference relationships simultaneously. The session concludes with a detailed breakdown of Positional Encodings (sinusoidal and learnable) and the exact backward pass gradient dynamics.`
    },
    notes: `# CS 182: Deep Learning — Attention & Transformers

## 1. Why Move Beyond Recurrent Architectures?
For years, sequential modeling relied on **Recurrent Neural Networks (RNNs)** and **LSTMs**:
- **Sequential Bottleneck:** Computing $h_t$ strictly requires $h_{t-1}$. Therefore, forward and backward operations cannot be parallelized across sequence length $T$.
- **Information Bottleneck:** The final hidden state $h_T$ must compress all previous context, leading to loss of early token information.
- **Vanishing/Exploding Gradients:** Backpropagating through hundreds of time steps leads to continuous matrix multiplications: $\\frac{\\partial h_t}{\\partial h_0} = \\prod_{k=1}^t W_{hh}^T \\text{diag}(\\sigma')$.

> **Exam Tip:** Whenever asked why Attention replaced RNNs, mention **parallel training on GPUs** and **direct $O(1)$ signal propagation paths between any two tokens**.

---

## 2. Mathematical Formulation of Self-Attention
Given an input sequence $X \\in \\mathbb{R}^{N \\times d}$, we compute three projections using learned parameter matrices:
- **Queries:** $Q = X W_Q \\quad (W_Q \\in \\mathbb{R}^{d \\times d_k})$
- **Keys:** $K = X W_K \\quad (W_K \\in \\mathbb{R}^{d \\times d_k})$
- **Values:** $V = X W_V \\quad (W_V \\in \\mathbb{R}^{d \\times d_v})$

### Scaled Dot-Product Attention Equation:
$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}}\\right) V$$

### Why divide by $\\sqrt{d_k}$?
If components of $q$ and $k$ are independent random variables with zero mean and unit variance:
$$\\mathbb{E}[q \\cdot k] = 0, \\quad \\text{Var}(q \\cdot k) = d_k$$
For large $d_k$ (e.g., $d_k = 64$ or $128$), the dot products grow extremely large, pushing the softmax function into regions with tiny gradients (gradient saturation). Scaling by $\\frac{1}{\\sqrt{d_k}}$ preserves unit variance.

---

## 3. Multi-Head Attention (MHA)
Instead of performing a single attention function, we project $Q, K, V$ into $h$ distinct representation subspaces:
$$\\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, \\dots, \\text{head}_h) W^O$$
$$\\text{where } \\text{head}_i = \\text{Attention}(Q W_i^Q, K W_i^K, V W_i^V)$$

**Key Benefit:** Allows the network to focus on "who did what" (subject-verb agreement), pronoun resolution ("it" refers to "dog"), and temporal relations across separate heads.

---

## 4. Positional Encodings
Because attention is permutation-invariant ($\\\\text{Attention}(P X) = P \\\\text{Attention}(X)$), order information must be injected:
$$PE_{(pos, 2i)} = \\sin\\left(\\frac{pos}{10000^{2i/d_{model}}}\\right)$$
$$PE_{(pos, 2i+1)} = \\cos\\left(\\frac{pos}{10000^{2i/d_{model}}}\\right)$$
`,
    keyConcepts: [
      {
        id: 'kc-1',
        term: 'Scaled Dot-Product Attention',
        definition: 'Attention mechanism mapping queries and key-value pairs where the score is normalized by the square root of the key dimension to prevent gradient vanishing in softmax.',
        importance: 'high',
        category: 'Architecture',
        example: 'Softmax((Q * K^T) / sqrt(d_k)) * V'
      },
      {
        id: 'kc-2',
        term: 'Multi-Head Attention',
        definition: 'Splitting query, key, and value vectors into multiple subspaces so the model can attend to information from different representation angles simultaneously.',
        importance: 'high',
        category: 'Architecture',
        example: '8 heads with d_k = 64 each for a total embedding size of 512.'
      },
      {
        id: 'kc-3',
        term: 'Positional Encoding',
        definition: 'Injected vector representations encoding token order into word embeddings to compensate for the permutation-invariant nature of self-attention.',
        importance: 'medium',
        category: 'Embeddings',
        example: 'Sinusoidal functions of differing frequencies across dimensions.'
      },
      {
        id: 'kc-4',
        term: 'Layer Normalization',
        definition: 'Normalization technique applied across features of a single sample independently, stabilizing hidden state dynamics during deep transformer training.',
        importance: 'medium',
        category: 'Optimization',
        example: 'LN(x + Sublayer(x))'
      }
    ],
    formulas: [
      {
        id: 'f-1',
        name: 'Scaled Dot-Product Attention',
        formula: '\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}}\\right) V',
        description: 'Computes weighted sum of values based on similarity between queries and keys.',
        variables: [
          { symbol: 'Q', explanation: 'Query matrix representing token requesting information' },
          { symbol: 'K', explanation: 'Key matrix representing token offering attributes' },
          { symbol: 'V', explanation: 'Value matrix containing actual feature representations' },
          { symbol: 'd_k', explanation: 'Dimensionality of keys and queries (scaling factor)' }
        ],
        units: 'Unitless similarity weights'
      },
      {
        id: 'f-2',
        name: 'Sinusoidal Positional Encoding',
        formula: 'PE_{(pos, 2i)} = \\sin\\left(\\frac{pos}{10000^{2i/d}}\\right), \\quad PE_{(pos, 2i+1)} = \\cos\\left(\\frac{pos}{10000^{2i/d}}\\right)',
        description: 'Assigns unique trigonometric wave signatures to each token position.',
        variables: [
          { symbol: 'pos', explanation: 'Zero-indexed position of the token in the sequence' },
          { symbol: 'i', explanation: 'Dimension index within the embedding vector' },
          { symbol: 'd', explanation: 'Total embedding dimensionality' }
        ]
      }
    ],
    flashcards: [
      {
        id: 'fc-1',
        front: 'What is the primary motivation for dividing by √d_k in Scaled Dot-Product Attention?',
        back: 'To prevent large dot products that push the softmax function into regions with near-zero gradients (gradient saturation).',
        category: 'Math',
        difficulty: 'medium',
        mastered: true
      },
      {
        id: 'fc-2',
        front: 'Why is Self-Attention permutation invariant without Positional Encodings?',
        back: 'Matrix multiplication treats rows independently without any inherent temporal sequencing; shuffling input rows results in an identically shuffled output.',
        category: 'Theory',
        difficulty: 'hard',
        mastered: false
      },
      {
        id: 'fc-3',
        front: 'What is the computational complexity of standard self-attention relative to sequence length N?',
        back: 'O(N² · d), because every token computes a dot product with every other token in the sequence.',
        category: 'Complexity',
        difficulty: 'easy',
        mastered: true
      },
      {
        id: 'fc-4',
        front: 'What role do residual connections (Add & Norm) play in Transformer layers?',
        back: 'They provide direct uninterrupted paths for gradient backpropagation, preventing vanishing gradients in deep multi-layer networks.',
        category: 'Architecture',
        difficulty: 'medium',
        mastered: false
      }
    ],
    quiz: [
      {
        id: 'q-1',
        question: 'Why did Transformers successfully replace RNNs for large language models?',
        options: [
          'Transformers have strictly fewer parameters than RNNs.',
          'Transformers eliminate sequential recurrence, allowing parallel GPU computation across tokens.',
          'Transformers do not require activation functions.',
          'Transformers only work on audio rather than text.'
        ],
        correctAnswerIndex: 1,
        explanation: 'The absence of sequential recurrent steps enables full parallel training over entire sequences on modern accelerator hardware like GPUs and TPUs.',
        topic: 'Architecture'
      },
      {
        id: 'q-2',
        question: 'If query and key dimensions d_k = 64, what is the scaling denominator in the attention formula?',
        options: [
          '64',
          '8',
          '32',
          '16'
        ],
        correctAnswerIndex: 1,
        explanation: 'The denominator is √d_k. Since √64 = 8, the dot product scores are divided by 8.',
        topic: 'Formulas'
      },
      {
        id: 'q-3',
        question: 'Which component ensures that tokens know their relative or absolute ordering in a Transformer?',
        options: [
          'Layer Normalization',
          'Feed-Forward Network (FFN)',
          'Positional Encoding',
          'Softmax temperature'
        ],
        correctAnswerIndex: 2,
        explanation: 'Positional encodings inject positional wave signals into token embeddings so the attention layers can distinguish sequence order.',
        topic: 'Architecture'
      }
    ],
    examQuestions: {
      shortAnswer: [
        {
          id: 'sa-1',
          question: 'Explain why the variance of the dot product between two independent random vectors with dimension d_k is equal to d_k.',
          sampleAnswer: 'Let q and k have elements with zero mean and unit variance. The dot product is the sum of d_k independent products q_i * k_i. The expectation of each term is E[q_i]E[k_i] = 0, and the variance is Var(q_i)Var(k_i) = 1. The variance of the sum of d_k independent variables is the sum of their variances: 1 + 1 + ... + 1 = d_k.',
          keyPoints: [
            'Zero mean and unit variance assumption for components',
            'Variance of product of independent zero-mean variables is product of variances (1 * 1 = 1)',
            'Sum of d_k independent variances results in total variance = d_k'
          ],
          marks: 4
        }
      ],
      longAnswer: [
        {
          id: 'la-1',
          question: 'Derive the complete multi-head attention formulation. Explain the trade-off between increasing head count versus head dimension, and justify why Multi-Head Attention outperforms single-head attention.',
          sampleAnswer: 'Multi-Head Attention projects input representations into h distinct lower-dimensional subspaces using parameter matrices W_i^Q, W_i^K in R^{d_model x d_k} and W_i^V in R^{d_model x d_v}. Each head computes scaled dot-product attention independently. The outputs are concatenated and linearly projected via W^O. Single-head attention forces the model to average over multiple semantic relations simultaneously (e.g., syntax vs semantics vs coreference). Multi-head allows separate attention heads to specialize independently.',
          markingRubric: [
            'Correct mathematical equations for projection, attention, and output projection (3 marks)',
            'Explanation of subspace projection and computational parity (h * d_k = d_model) (2 marks)',
            'Justification with practical linguistic/representational examples (coreference, grammar) (3 marks)',
            'Clear derivation of time/space complexity O(N^2 * d) (2 marks)'
          ],
          marks: 10
        }
      ]
    },
    transcript: [
      { time: '00:00:15', speaker: 'Prof. Levine', text: 'Good morning everyone. Today we are addressing one of the most pivotal papers in modern machine learning: "Attention Is All You Need".' },
      { time: '00:01:20', speaker: 'Prof. Levine', text: 'To understand why Transformers took over, we must look at what made recurrent neural networks painful to train. In an LSTM or standard RNN, token t cannot begin computing until token t minus 1 is done.' },
      { time: '00:03:45', speaker: 'Prof. Levine', text: 'Look at the board here: we define Queries, Keys, and Values. Think of Query as your search term in Google, Keys as video titles, and Values as the actual video content.' },
      { time: '00:07:10', speaker: 'Prof. Levine', text: 'Notice that division by square root of d_k. Why do we divide? If d_k is 128, dot products become huge, and softmax gradients vanish. This tiny square root is what stabilizes training!' }
    ]
  },
  {
    id: 'lec-bio-201',
    title: 'BIO 201: Cellular Respiration — Glycolysis, Pyruvate Oxidation & The Krebs Cycle',
    subject: 'Biology & Pre-Med',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    durationMinutes: 48,
    sourceType: 'pdf',
    sourceFileName: 'cellular_respiration_handout.pdf',
    sourceFileSize: 12400000,
    status: 'ready',
    summary: {
      tldr: 'Comprehensive metabolic walkthrough of eukaryotic aerobic respiration, comparing ATP yield, substrate-level versus oxidative phosphorylation, and electron carrier dynamics (NADH and FADH2).',
      keyTakeaways: [
        'Glycolysis occurs in the cytoplasm and requires no oxygen, producing net 2 ATP and 2 NADH per glucose.',
        'Pyruvate dehydrogenase links glycolysis to the Krebs cycle inside the mitochondrial matrix.',
        'The Citric Acid Cycle produces 6 NADH, 2 FADH2, and 2 ATP/GTP per original glucose molecule.',
        'Chemiosmosis via the proton electrochemical gradient across the inner mitochondrial membrane powers ATP synthase.',
        'Theoretical net yield is approximately 30-32 ATP per oxidized glucose molecule.'
      ],
      detailedSummary: `This lecture breaks down how living cells convert biochemical energy from nutrients into adenosine triphosphate (ATP). 

Dr. Harrison covers the 4 distinct stages of aerobic cellular respiration:
1. Glycolysis in the cytosol (energy investment and energy payoff phases).
2. Pyruvate oxidation (forming Acetyl-CoA and releasing CO2).
3. The Citric Acid (Krebs) cycle within the mitochondrial matrix.
4. Oxidative Phosphorylation (Electron Transport Chain complexes I-IV coupled with ATP synthase).

Special focus is given to high-yield MCAT/exam questions regarding electron stoichiometry, metabolic regulation by phosphofructokinase (PFK-1), and the distinction between substrate-level phosphorylation and oxidative phosphorylation.`
    },
    notes: `# BIO 201: Cellular Respiration & ATP Bioenergetics

## 1. Overall Chemical Reaction
$$\\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2 \\longrightarrow 6\\text{CO}_2 + 6\\text{H}_2\\text{O} + 30\\text{-}32\\,\\text{ATP}$$
- Glucose is **oxidized** into carbon dioxide.
- Molecular oxygen is **reduced** into water (terminal electron acceptor).

---

## 2. Stage 1: Glycolysis (Cytosol)
- **Starting Substrate:** 1 Glucose (6-Carbon)
- **End Products:** 2 Pyruvate (3-Carbon), 2 NADH, 2 Net ATP (4 produced - 2 invested).
- **Key Regulatory Enzyme:** **Phosphofructokinase-1 (PFK-1)**
  - Allosterically inhibited by high ATP and citrate (signals energy surplus).
  - Allosterically activated by AMP and fructose-2,6-bisphosphate.

---

## 3. Stage 2: Pyruvate Oxidation (Mitochondrial Matrix)
Pyruvate is actively transported into the mitochondrial matrix via pyruvate translocase:
$$\\text{Pyruvate} + \\text{NAD}^+ + \\text{CoA-SH} \\xrightarrow{\\text{PDH}} \\text{Acetyl-CoA} + \\text{NADH} + \\text{CO}_2$$
*(Occurs twice per glucose molecule)*

---

## 4. Stage 3: The Citric Acid (Krebs) Cycle
Occurs in the mitochondrial matrix:
- **Oxaloacetate (4C)** combines with **Acetyl-CoA (2C)** to form **Citrate (6C)** catalyzed by Citrate Synthase.
- Per turn (1 Acetyl-CoA): $3\\,\\text{NADH}, 1\\,\\text{FADH}_2, 1\\,\\text{GTP/ATP}, 2\\,\\text{CO}_2$.
- Per original Glucose (2 Acetyl-CoA): $6\\,\\text{NADH}, 2\\,\\text{FADH}_2, 2\\,\\text{ATP}, 4\\,\\text{CO}_2$.
`,
    keyConcepts: [
      {
        id: 'kc-bio-1',
        term: 'Phosphofructokinase-1 (PFK-1)',
        definition: 'Rate-limiting commitment step enzyme of glycolysis that phosphorylates fructose-6-phosphate to fructose-1,6-bisphosphate.',
        importance: 'high',
        category: 'Enzymes',
        example: 'Inhibited by high ATP/citrate; activated by high AMP.'
      },
      {
        id: 'kc-bio-2',
        term: 'Substrate-Level Phosphorylation',
        definition: 'Direct enzymatic transfer of a high-energy phosphate group from an organic metabolic intermediate directly to ADP.',
        importance: 'high',
        category: 'Bioenergetics',
        example: 'Phosphoglycerate kinase reaction in glycolysis.'
      },
      {
        id: 'kc-bio-3',
        term: 'Chemiosmosis',
        definition: 'The movement of hydrogen ions (protons) across a semipermeable membrane down their electrochemical gradient to generate ATP via ATP synthase.',
        importance: 'high',
        category: 'Mechanisms',
        example: 'Peter Mitchell hypothesis across inner mitochondrial membrane.'
      }
    ],
    formulas: [
      {
        id: 'f-bio-1',
        name: 'Cellular Respiration Net Bioenergetics',
        formula: '\\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2 \\longrightarrow 6\\text{CO}_2 + 6\\text{H}_2\\text{O} + \\Delta G^\\circ = -2870\\,\\text{kJ/mol}',
        description: 'Standard Gibbs free energy released by complete oxidation of one mole of glucose.',
        variables: [
          { symbol: '\\Delta G^\\circ', explanation: 'Standard Gibbs free energy change under physiological conditions' }
        ],
        units: 'kJ/mol'
      }
    ],
    flashcards: [
      {
        id: 'fc-bio-1',
        front: 'Where does Glycolysis take place in eukaryotic cells, and does it require oxygen?',
        back: 'In the cytosol (cytoplasm); it is an anaerobic process that does not require molecular oxygen.',
        category: 'Location',
        difficulty: 'easy',
        mastered: true
      },
      {
        id: 'fc-bio-2',
        front: 'What is the theoretical ATP yield per NADH versus per FADH2 in oxidative phosphorylation?',
        back: '~2.5 ATP per NADH (enters at Complex I), and ~1.5 ATP per FADH2 (enters at Complex II).',
        category: 'Yield',
        difficulty: 'medium',
        mastered: false
      },
      {
        id: 'fc-bio-3',
        front: 'What is the final electron acceptor in the mitochondrial electron transport chain?',
        back: 'Molecular Oxygen (O2), which accepts electrons and protons to form metabolic water (H2O).',
        category: 'Biochemistry',
        difficulty: 'easy',
        mastered: true
      }
    ],
    quiz: [
      {
        id: 'q-bio-1',
        question: 'Which of the following enzymes acts as the primary committed and rate-limiting step of glycolysis?',
        options: [
          'Hexokinase',
          'Phosphofructokinase-1 (PFK-1)',
          'Pyruvate Kinase',
          'Aldolase'
        ],
        correctAnswerIndex: 1,
        explanation: 'PFK-1 catalyzes the irreversibly committed phosphorylation of fructose-6-phosphate to fructose-1,6-bisphosphate.',
        topic: 'Enzymology'
      },
      {
        id: 'q-bio-2',
        question: 'How many total NADH molecules are produced from the complete oxidation of one glucose molecule during cellular respiration?',
        options: [
          '4 NADH',
          '6 NADH',
          '10 NADH',
          '12 NADH'
        ],
        correctAnswerIndex: 2,
        explanation: '2 from Glycolysis + 2 from Pyruvate Oxidation + 6 from the Krebs Cycle = 10 total NADH.',
        topic: 'Stoichiometry'
      }
    ],
    examQuestions: {
      shortAnswer: [
        {
          id: 'sa-bio-1',
          question: 'Contrast substrate-level phosphorylation with oxidative phosphorylation in terms of mechanism and cellular location.',
          sampleAnswer: 'Substrate-level phosphorylation occurs in both cytosol (glycolysis) and mitochondrial matrix (Krebs cycle) via direct soluble enzyme transfer of phosphate from substrate to ADP. Oxidative phosphorylation occurs exclusively across the inner mitochondrial membrane, requiring an electron transport chain and proton-motive force through ATP synthase.',
          keyPoints: [
            'Direct enzymatic phosphate transfer vs proton motive force',
            'Cytosol and matrix vs inner mitochondrial membrane',
            'Relative ATP yield (4 net vs 26-28 ATP)'
          ],
          marks: 5
        }
      ],
      longAnswer: [
        {
          id: 'la-bio-1',
          question: 'Describe how uncoupling agents such as 2,4-dinitrophenol (DNP) affect oxygen consumption, the proton gradient, and ATP synthesis in the electron transport chain.',
          sampleAnswer: 'DNP is a lipophilic weak acid that binds protons in the intermembrane space and transports them across the inner mitochondrial membrane into the matrix, bypassing ATP synthase. This dissipates the electrochemical proton gradient. As a consequence, ATP synthase cannot synthesize ATP. The ETC continues to oxidize NADH and FADH2 at maximal rates, consuming oxygen furiously to restore the gradient, releasing the energy entirely as heat (hyperthermia).',
          markingRubric: [
            'Mechanism of membrane proton shuttle (2 marks)',
            'Effect on proton motive force (gradient collapse) (2 marks)',
            'Effect on ATP synthase inhibition (2 marks)',
            'Effect on oxygen consumption (remains elevated/increases) (2 marks)',
            'Dissipation of energy as heat (thermogenesis) (2 marks)'
          ],
          marks: 10
        }
      ]
    },
    transcript: [
      { time: '00:00:20', speaker: 'Dr. Harrison', text: 'Welcome students. Today we dissect the chemical engine that powers almost all aerobic life on Earth: cellular respiration.' },
      { time: '00:05:10', speaker: 'Dr. Harrison', text: 'Notice that glycolysis takes place outside the mitochondria, right in the cytosol. This is evidence of its ancient evolutionary origin before endosymbiosis.' },
      { time: '00:15:30', speaker: 'Dr. Harrison', text: 'Keep PFK-1 in your notes with a big star. When ATP levels climb, ATP paradoxically inhibits PFK-1 to conserve glucose reserves.' }
    ]
  },
  {
    id: 'lec-econ-102',
    title: 'ECON 102: Macroeconomics — Central Banking, IS-LM Model & Inflation Targeting',
    subject: 'Economics & Finance',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    durationMinutes: 44,
    sourceType: 'text',
    sourceFileName: 'macro_lecture_transcript.txt',
    sourceFileSize: 185000,
    status: 'ready',
    summary: {
      tldr: 'An analysis of macroeconomic equilibrium using the IS-LM framework, the Taylor Rule for monetary policy, and the trade-offs of quantitative easing during liquidity traps.',
      keyTakeaways: [
        'The IS curve represents goods market equilibrium where national savings equal planned investment (downward sloping).',
        'The LM curve represents money market equilibrium where real money demand equals money supply (upward sloping).',
        'At the Zero Lower Bound (ZLB), conventional interest rate cuts lose efficacy, forcing central banks toward Quantitative Easing (QE).',
        'The Taylor Rule provides an empirical benchmark for setting policy rates based on inflation gaps and output gaps.',
        'Crowding out occurs when expansionary fiscal policy increases interest rates, dampening private investment expenditure.'
      ],
      detailedSummary: `This lecture provides a rigorous treatment of short-run macroeconomic fluctuations. 

Professor Martinez explores how central banks (such as the Federal Reserve and ECB) manage dual mandates of maximum employment and price stability. 

The lecture connects the classical goods market with money market equilibria through the IS-LM framework. Detailed derivations show the fiscal multiplier, monetary policy transmission mechanisms, and the liquidity trap where the LM curve becomes perfectly horizontal.`
    },
    notes: `# ECON 102: Macroeconomics — IS-LM Equilibrium & Monetary Policy

## 1. The Goods Market (IS Curve)
The IS (Investment-Savings) curve represents all combinations of interest rates $r$ and real output $Y$ where aggregate demand equals aggregate output:
$$Y = C(Y - T) + I(r) + G + NX$$
- **Slope:** Downward sloping because higher interest rates increase borrowing costs, reducing capital investment $I(r)$ and consumption $C$, which lowers equilibrium output $Y$.
- **Fiscal Shifts:** An increase in government spending $\\Delta G$ shifts the IS curve rightward by $\\Delta G \\times \\frac{1}{1 - MPC}$.

---

## 2. The Money Market (LM Curve)
The LM (Liquidity preference-Money supply) curve shows money market equilibrium:
$$\\frac{M}{P} = L(r, Y)$$
- **Slope:** Upward sloping because an increase in output $Y$ increases transaction demand for money. With a fixed real money supply $\\frac{M}{P}$, interest rates $r$ must rise to restore equilibrium.

---

## 3. The Taylor Rule for Central Banks
$$r_t = r^* + \\pi_t + 0.5(\\pi_t - \\pi^*) + 0.5(y_t - y^*)$$
- $r^*$: Neutral real interest rate
- $\\pi_t - \\pi^*$: Inflation gap relative to target (e.g. 2%)
- $y_t - y^*$: Output gap (percentage deviation of actual GDP from potential GDP)
`,
    keyConcepts: [
      {
        id: 'kc-econ-1',
        term: 'IS Curve',
        definition: 'Goods market equilibrium curve showing inverse relationship between interest rates and national income/output.',
        importance: 'high',
        category: 'Equilibrium',
        example: 'Downwards sloping in (Y, r) space.'
      },
      {
        id: 'kc-econ-2',
        term: 'Liquidity Trap',
        definition: 'A situation at the zero lower bound where nominal interest rates cannot fall further and demand for money becomes infinitely elastic.',
        importance: 'high',
        category: 'Monetary Policy',
        example: 'Post-2008 Japan and US zero interest rate policy.'
      },
      {
        id: 'kc-econ-3',
        term: 'Crowding Out Effect',
        definition: 'Reduction in private investment that occurs when increased government borrowing drives up interest rates in the loanable funds market.',
        importance: 'medium',
        category: 'Fiscal Policy',
        example: 'High deficit issuance causing mortgage rates to climb.'
      }
    ],
    formulas: [
      {
        id: 'f-econ-1',
        name: 'The Taylor Rule',
        formula: 'r = r^* + \\pi + 0.5(\\pi - \\pi^*) + 0.5(y - y^*)',
        description: 'Prescriptive monetary policy rule recommending target federal funds rate.',
        variables: [
          { symbol: 'r', explanation: 'Target nominal policy interest rate' },
          { symbol: 'r^*', explanation: 'Equilibrium neutral real interest rate' },
          { symbol: '\\pi', explanation: 'Current rate of inflation' },
          { symbol: '\\pi^*', explanation: 'Target inflation rate (typically 2%)' },
          { symbol: 'y - y^*', explanation: 'Output gap as percent of potential GDP' }
        ],
        units: 'Percentage points (%)'
      }
    ],
    flashcards: [
      {
        id: 'fc-econ-1',
        front: 'Why does the IS curve slope downwards in (Y, r) space?',
        back: 'Because higher interest rates increase borrowing costs, depressing private investment and consumption, which reduces equilibrium output Y.',
        category: 'Theory',
        difficulty: 'medium',
        mastered: true
      },
      {
        id: 'fc-econ-2',
        front: 'What is Quantitative Easing (QE) and when is it employed?',
        back: 'Large-scale asset purchases by a central bank to inject liquidity and lower long-term yields when short-term rates hit the Zero Lower Bound.',
        category: 'Policy',
        difficulty: 'medium',
        mastered: true
      }
    ],
    quiz: [
      {
        id: 'q-econ-1',
        question: 'Under the IS-LM framework, what happens when the central bank conducts an open market purchase of government bonds?',
        options: [
          'Money supply increases, shifting LM curve rightward, lowering interest rates and raising output.',
          'Money supply decreases, shifting IS curve leftward.',
          'Interest rates rise and consumption falls.',
          'Price levels instantly drop to zero.'
        ],
        correctAnswerIndex: 0,
        explanation: 'Open market purchases inject reserves into commercial banks, increasing money supply, shifting LM rightward, which lowers r and stimulates investment Y.',
        topic: 'Monetary Mechanics'
      }
    ],
    examQuestions: {
      shortAnswer: [
        {
          id: 'sa-econ-1',
          question: 'Define the crowding out effect and explain under what macroeconomic conditions it is least likely to occur.',
          sampleAnswer: 'Crowding out occurs when government deficit spending shifts the IS curve right, driving up money demand and interest rates, which reduces interest-sensitive private investment. It is least likely to occur in a liquidity trap (at the Zero Lower Bound) where the LM curve is horizontal, meaning output expands without any rise in interest rates.',
          keyPoints: [
            'Mechanism: government borrowing drives up interest rates',
            'Consequence: reduction in private capital investment',
            'Exception: Horizontal LM curve in a liquidity trap where crowding out is near zero'
          ],
          marks: 4
        }
      ],
      longAnswer: [
        {
          id: 'la-econ-1',
          question: 'Using the IS-LM model, evaluate the effectiveness of fiscal versus monetary policy when an economy is stuck in a liquidity trap. Supplement your answer with graphs or step-by-step mathematical reasoning.',
          sampleAnswer: 'In a liquidity trap, nominal interest rates are at the Zero Lower Bound (ZLB). The LM curve is horizontal at r = 0 because money and short-term bonds become perfect substitutes. Consequently: 1) Monetary policy is completely ineffective: shifting the LM curve rightward does not lower interest rates or expand output. 2) Fiscal policy is maximally effective: an increase in government spending shifts the IS curve right along the flat LM curve, delivering the full Keynesian multiplier without any crowding-out rise in interest rates.',
          markingRubric: [
            'Accurate characterization of horizontal LM curve at ZLB (3 marks)',
            'Proof of monetary policy impotence in liquidity trap (3 marks)',
            'Proof of maximum fiscal policy efficacy without crowding out (3 marks)',
            'Discussion of real-world policy responses like Quantitative Easing (1 mark)'
          ],
          marks: 10
        }
      ]
    },
    transcript: [
      { time: '00:00:10', speaker: 'Prof. Martinez', text: 'Welcome back. Today we tackle the workhorse of intermediate macro: the IS-LM model.' },
      { time: '00:08:45', speaker: 'Prof. Martinez', text: 'Remember that John Hicks invented this diagram to mathematically formalize Keynes’s General Theory. The IS curve is the real economy; the LM curve is financial liquidity.' }
    ]
  }
];
