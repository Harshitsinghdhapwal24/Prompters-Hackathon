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
      title: 'Total Lectures Processed',
      value: totalLectures,
      subtitle: `${lectures.reduce((acc, l) => acc + (l.durationMinutes || 0), 0)} mins analyzed`,
      icon: BookOpen,
      color: 'from-purple-500 to-indigo-600',
      textColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Study Notes Generated',
      value: totalNotes,
      subtitle: 'Complete with key formulas & terms',
      icon: FileText,
      color: 'from-blue-500 to-cyan-600',
      textColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Flashcards Created',
      value: totalFlashcards,
      subtitle: `${masteredFlashcards} mastered by you`,
      icon: Layers,
      color: 'from-indigo-500 to-purple-600',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-500/10',
    },
    {
      title: 'Practice Quiz Bank',
      value: totalQuizQuestions,
      subtitle: 'High-yield questions available',
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, idx) => {
        const Icon = s.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {s.title}
              </span>
              <div className={`p-2.5 rounded-xl ${s.bgColor} ${s.textColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {s.value}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              {s.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
}
