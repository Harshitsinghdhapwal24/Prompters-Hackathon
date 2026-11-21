# 🎓 LectureLens — AI-Powered Lecture to Study Material Generator

> **Turn lectures into learning.** An elite academic study assistant designed for college students, university scholars, and competitive exam aspirants (MCAT, GRE, GATE, USMLE).

LectureLens converts classroom lectures, audio recordings (MP3, WAV, M4A), lecture videos (MP4, WebM), slides/PDFs, and text transcripts into comprehensive, exam-grade study packages powered by **Google Gemini AI**.

---

## ✨ Core Features

1. **🎙️ Multimodal Lecture Upload:**
   - **Audio Upload:** Support for MP3, WAV, M4A with audio transcription.
   - **Video Upload:** MP4 and WebM classroom lecture recording processing.
   - **Document Processing:** PDF lecture handouts, slides, and TXT files.
   - **Direct Transcript Editor:** Paste transcripts or messy notes directly.
   - **Live Progress Tracking:** Step-by-step cognitive progress indicator.

2. **📝 Comprehensive Study Packages Generated:**
   - **Executive Summaries:** 2-sentence punchy TL;DR + 5-7 bulleted key takeaways + chapter-by-chapter synthesis.
   - **Structured Markdown Study Notes:** Headings, subheadings, bold terms, exam warning callouts, and mathematical LaTeX expressions.
   - **Key Concepts & Glossary:** High, medium, and low priority conceptual definitions with real-world examples and interactive filtering.
   - **Governing Formulas & Math:** LaTeX formula display, physical/economic interpretation, variable breakdown keys, and units.
   - **3D Interactive Flashcards:** Smooth CSS 3D perspective flip, Active Recall tracking (*Mastered* vs *Needs Review*), keyboard shortcuts (`[Space]` to flip, `[←]/[→]` to navigate), shuffle mode, and progress metrics.
   - **Examination Practice Quiz:** Rigorous multiple-choice questions with instant feedback, deep answer explanations, score calculations, and celebratory confetti effects.
   - **Short & Long Answer Exam Questions:** Realistic midterm/final exam questions complete with model high-scoring solutions and examiner marking rubrics.
   - **Full Transcript:** Timestamped speaker dialogue with search and one-click copy.
   - **📄 Downloadable PDF Export:** One-click formatted PDF study guide generation powered by client-side PDF rendering.

3. **🎨 Design System (Linear & Notion Inspired):**
   - Elegant dark and light themes with seamless toggle.
   - Purple/blue accent colors and glowing gradients.
   - Mobile-responsive navigation and drawer.
   - Fast, client-side zero-latency storage with realistic preloaded college demo lectures (CS 182 Deep Learning, BIO 201 Cellular Respiration, ECON 102 Macroeconomics).

---

## 🛠️ Technology Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, PostCSS, Lucide React icons
- **AI Engine:** Google Gemini API using the official `@google/genai` SDK
- **Configurable Models:** `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`
- **PDF Generation:** `jspdf`
- **Delight Effects:** `canvas-confetti`
- **Storage:** Browser localStorage architecture (pre-configured for future Supabase sync)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js v18+ (tested on Node.js v20 LTS)
- npm or pnpm

### 2. Installation
```bash
npm install
```

### 3. Environment Configuration (Optional)
Create or edit `.env.local`:
```env
# Optional: Set your Gemini API key (or configure directly in the web UI under Settings)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

> **Note:** If no API key is provided, LectureLens operates seamlessly in **Demonstration Mode**, synthesizing realistic, rich academic study materials so judges and users can test all upload flows out-of-the-box!

### 4. Running the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Architecture

```
├── src/
│   ├── app/
│   │   ├── api/generate/route.ts      # Server-side Gemini AI generation route
│   │   ├── flashcards/page.tsx        # Active Recall Flashcards Hub
│   │   ├── lectures/page.tsx          # My Lectures library with search & filters
│   │   ├── lectures/[id]/page.tsx     # Study Material Viewer
│   │   ├── quiz/page.tsx              # Exam Practice Quiz Hub
│   │   ├── settings/page.tsx          # API Key, Model & Theme Settings
│   │   ├── upload/page.tsx            # Multimodal Lecture Upload page
│   │   ├── globals.css                # Tailwind, 3D flip card, and theme styles
│   │   ├── layout.tsx                 # Root layout with Sidebar and Header
│   │   └── page.tsx                   # Main Dashboard
│   ├── components/
│   │   ├── dashboard/                 # StatCards, QuickActions, RecentLectures
│   │   ├── layout/                    # Sidebar, Header, Theme toggles
│   │   ├── settings/                  # SettingsView
│   │   ├── study/                     # StudyMaterialViewer, FlashcardsViewer,
│   │   │                              # PracticeQuiz, StudyNotesTab, KeyConceptsTab,
│   │   │                              # ExamQuestionsTab, SummaryTab, TranscriptTab
│   │   └── upload/                    # LectureUploadZone
│   ├── context/
│   │   └── ThemeContext.tsx           # Dark/Light mode provider
│   ├── data/
│   │   └── demoLectures.ts            # Realistic preloaded MIT/Stanford demo data
│   ├── lib/
│   │   ├── geminiPrompt.ts            # Academic study material prompt engineering
│   │   ├── pdfGenerator.ts            # jsPDF study guide export utility
│   │   └── storage.ts                 # LocalStorage persistence & settings
│   └── types/
│       └── lecture.ts                 # TypeScript interfaces and data models
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 🏆 Hackathon Demonstration Flow

1. **Explore the Dashboard:** Observe stats counters, quick actions, and the pre-loaded college lectures (*CS 182: Transformers*, *BIO 201: Cellular Respiration*, *ECON 102: Macroeconomics*).
2. **Dive into a Study Guide:** Click into any lecture to view the **Executive Summary**, **Structured Notes**, **Key Concepts & Formulas**, and **Timestamped Transcript**.
3. **Test Active Recall Flashcards:** Click the **Flashcards** tab, flip cards with `[Space]`, test your memory, and mark cards as Mastered.
4. **Take the Practice Quiz:** Answer multiple-choice questions with instant feedback and explanations, finishing with celebratory confetti!
5. **Download PDF:** Click **"Download PDF"** on any lecture to receive a formatted, print-ready study guide.
6. **Upload Your Own Lecture:** Navigate to **Create New Notes**, drop an audio/video/document file or paste text, and watch Gemini AI construct the study guide.
7. **Configure Settings:** Visit **Settings** to plug in a custom Gemini API key or switch between `gemini-2.5-flash`, `gemini-2.0-flash`, and other models.

---

Designed with ❤️ for students worldwide.
