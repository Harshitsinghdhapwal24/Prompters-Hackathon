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
    <div className="space-y-5">
      {/* Executive Briefing Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200/80 dark:border-slate-800/80 shadow-subtle relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Executive Summary
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
          {summary.tldr}
        </p>
      </div>

      {/* Key Takeaways */}
      {summary.keyTakeaways && summary.keyTakeaways.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Core Takeaways
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {summary.keyTakeaways.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white dark:bg-[#0e1422] border border-slate-200/80 dark:border-slate-800/80 flex items-start gap-2.5 shadow-subtle hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="p-0.5 rounded-full text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Narrative */}
      {summary.detailedSummary && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-2.5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Detailed Synthesis
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
