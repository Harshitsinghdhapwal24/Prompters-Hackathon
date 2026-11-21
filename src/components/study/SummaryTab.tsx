'use client';

import React from 'react';
import { Sparkles, CheckCircle2, BookOpen, Lightbulb } from 'lucide-react';
import { Lecture } from '@/types/lecture';

interface SummaryTabProps {
  lecture: Lecture;
}

export default function SummaryTab({ lecture }: SummaryTabProps) {
  const { summary } = lecture;

  return (
    <div className="space-y-6">
      {/* TL;DR Highlight Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-blue-500/10 border border-purple-200/80 dark:border-purple-900/60 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-purple-600 text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
            Executive Summary (TL;DR)
          </h3>
        </div>
        <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
          {summary.tldr}
        </p>
      </div>

      {/* Key Takeaways Grid */}
      {summary.keyTakeaways && summary.keyTakeaways.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Critical Key Takeaways
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {summary.keyTakeaways.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 flex items-start gap-3 shadow-sm hover:border-purple-300 dark:hover:border-purple-800/60 transition-colors"
              >
                <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Lecture Narrative */}
      {summary.detailedSummary && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Detailed Lecture Synthesis
            </h4>
          </div>
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {summary.detailedSummary}
          </div>
        </div>
      )}
    </div>
  );
}
