'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, UploadCloud } from 'lucide-react';
import LectureUploadZone from '@/components/upload/LectureUploadZone';

export default function UploadPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800/50 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> Multimodal Lecture Processor
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Create New Study Materials
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Upload audio, video recordings, slides, or paste lecture notes. Google Gemini AI will
          generate notes, flashcards, formulas, and quizzes in seconds.
        </p>
      </div>

      {/* Upload Zone */}
      <LectureUploadZone />
    </div>
  );
}
