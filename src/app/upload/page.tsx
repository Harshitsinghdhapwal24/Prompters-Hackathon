'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import LectureUploadZone from '@/components/upload/LectureUploadZone';

export default function UploadPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
      </div>

      <div className="text-center max-w-lg mx-auto space-y-1.5">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Create Study Package
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Upload audio, video, slides, or paste lecture notes. Google Gemini AI will generate
          structured notes, active recall flashcards, and practice quizzes.
        </p>
      </div>

      <LectureUploadZone />
    </div>
  );
}
