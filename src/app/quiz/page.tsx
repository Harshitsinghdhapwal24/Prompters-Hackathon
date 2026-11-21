'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HelpCircle, Sparkles, ArrowRight, Award } from 'lucide-react';
import { getStoredLectures } from '@/lib/storage';
import { Lecture } from '@/types/lecture';
import PracticeQuiz from '@/components/study/PracticeQuiz';

export default function QuizHubPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');

  useEffect(() => {
    const data = getStoredLectures();
    setLectures(data);
    if (data.length > 0 && !selectedId) {
      setSelectedId(data[0].id);
    }
  }, []);

  const selectedLecture = lectures.find((l) => l.id === selectedId) || lectures[0];
  const totalQuestions = lectures.reduce((acc, l) => acc + (l.quiz?.length || 0), 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Award className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Examination Practice
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Exam Practice Quiz Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {totalQuestions} high-yield multiple-choice questions ready to test your exam readiness.
        </p>
      </div>

      {/* Quiz Deck Selector Pills */}
      {lectures.length > 0 && (
        <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-x-auto scrollbar-none shadow-sm">
          {lectures.map((lec) => {
            const isSelected = lec.id === selectedLecture?.id;

            return (
              <button
                key={lec.id}
                onClick={() => setSelectedId(lec.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
                }`}
              >
                <span>{lec.subject}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  {lec.quiz?.length || 0} Qs
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Lecture Quiz */}
      {selectedLecture ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase">
                Topic: {selectedLecture.subject}
              </span>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {selectedLecture.title}
              </h3>
            </div>
            <Link
              href={`/lectures/${selectedLecture.id}`}
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
            >
              Full Study Guide <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <PracticeQuiz quiz={selectedLecture.quiz || []} />
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500">No practice quiz questions available.</p>
        </div>
      )}
    </div>
  );
}
