'use client';

import React from 'react';
import { BookOpen, FileText, Layers, CheckCircle2, TrendingUp } from 'lucide-react';
import { Lecture } from '@/types/lecture';

interface StatCardsProps {
  lectures: Lecture[];
}

export default function StatCards({ lectures }: StatCardsProps) {
  const totalLectures = lectures.length;
  const totalNotes = lectures.filter((l) => l.notes).length;
  const totalFlashcards = lectures.reduce((acc, l) => acc + (l.flashcards?.length || 0), 0);
  const masteredFlashcards = lectures.reduce(
    (acc, l) => acc + (l.flashcards?.filter((f) => f.mastered)?.length || 0),
    0
  );
  const totalQuizQuestions = lectures.reduce((acc, l) => acc + (l.quiz?.length || 0), 0);

  const stats = [
    {
      title: 'Lectures Processed',
      value: totalLectures,
      subtitle: `${lectures.reduce((acc, l) => acc + (l.durationMinutes || 0), 0)} mins analyzed`,
      icon: BookOpen,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/50',
    },
    {
      title: 'Notes Generated',
      value: totalNotes,
      subtitle: 'Complete study guides & formulas',
      icon: FileText,
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-50 dark:bg-blue-950/50',
    },
    {
      title: 'Flashcards Created',
      value: totalFlashcards,
      subtitle: `${masteredFlashcards} marked as mastered`,
      icon: Layers,
      iconColor: 'text-slate-700 dark:text-slate-300',
      iconBg: 'bg-slate-100 dark:bg-slate-800',
    },
    {
      title: 'Practice Questions',
      value: totalQuizQuestions,
      subtitle: 'Verified test-ready items',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {stats.map((s, idx) => {
        const Icon = s.icon;
        return (
          <div
            key={idx}
            className="p-4 rounded-xl bg-white dark:bg-[#0e1422] border border-slate-200/80 dark:border-slate-800/80 shadow-subtle hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {s.title}
              </span>
              <div className={`p-2 rounded-lg ${s.iconBg} ${s.iconColor}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {s.value}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              {s.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
}
