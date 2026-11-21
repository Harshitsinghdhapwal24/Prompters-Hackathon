'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, CheckCircle2, Award, ListChecks } from 'lucide-react';
import { ShortAnswerQuestion, LongAnswerQuestion } from '@/types/lecture';

interface ExamQuestionsTabProps {
  shortAnswer: ShortAnswerQuestion[];
  longAnswer: LongAnswerQuestion[];
}

export default function ExamQuestionsTab({ shortAnswer, longAnswer }: ExamQuestionsTabProps) {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  const toggleOpen = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const hasShort = shortAnswer && shortAnswer.length > 0;
  const hasLong = longAnswer && longAnswer.length > 0;

  if (!hasShort && !hasLong) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
        <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          No Exam Questions Available
        </h4>
        <p className="text-xs text-slate-400 mt-1">
          Exam questions with marking rubrics are generated during lecture synthesis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Short Answer Questions Section */}
      {hasShort && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Short Answer Questions ({shortAnswer.length})
            </h3>
          </div>

          <div className="space-y-3">
            {shortAnswer.map((q, idx) => {
              const isOpen = Boolean(openIds[q.id]);

              return (
                <div
                  key={q.id}
                  className="rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => toggleOpen(q.id)}
                    className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/50 flex-shrink-0 mt-0.5">
                        {q.marks} Marks
                      </span>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                        Q{idx + 1}: {q.question}
                      </h4>
                    </div>

                    <div className="p-1 rounded-lg text-slate-400 flex-shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800/60 space-y-4 text-xs sm:text-sm bg-slate-50/50 dark:bg-slate-900/30">
                      {/* Sample Answer */}
                      <div className="space-y-1.5 pt-4">
                        <span className="font-bold uppercase tracking-wider text-[11px] text-purple-700 dark:text-purple-300">
                          Model Answer:
                        </span>
                        <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                          {q.sampleAnswer}
                        </p>
                      </div>

                      {/* Key Points */}
                      {q.keyPoints && q.keyPoints.length > 0 && (
                        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Required Key Points for Full Marks:
                          </span>
                          <div className="space-y-1">
                            {q.keyPoints.map((pt, pIdx) => (
                              <div
                                key={pIdx}
                                className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                <span>{pt}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Long Answer Questions Section */}
      {hasLong && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Long Answer & Analytical Problems ({longAnswer.length})
            </h3>
          </div>

          <div className="space-y-3">
            {longAnswer.map((q, idx) => {
              const isOpen = Boolean(openIds[q.id]);

              return (
                <div
                  key={q.id}
                  className="rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => toggleOpen(q.id)}
                    className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50 flex-shrink-0 mt-0.5">
                        {q.marks} Marks
                      </span>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                        Q{idx + 1}: {q.question}
                      </h4>
                    </div>

                    <div className="p-1 rounded-lg text-slate-400 flex-shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800/60 space-y-4 text-xs sm:text-sm bg-slate-50/50 dark:bg-slate-900/30">
                      {/* Sample Essay / Derivation */}
                      <div className="space-y-1.5 pt-4">
                        <span className="font-bold uppercase tracking-wider text-[11px] text-indigo-600 dark:text-indigo-400">
                          Comprehensive Exemplary Solution:
                        </span>
                        <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-line">
                          {q.sampleAnswer}
                        </p>
                      </div>

                      {/* Marking Rubric Breakdown */}
                      {q.markingRubric && q.markingRubric.length > 0 && (
                        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Examiner Marking Rubric:
                          </span>
                          <div className="space-y-1.5">
                            {q.markingRubric.map((item, rIdx) => (
                              <div
                                key={rIdx}
                                className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300"
                              >
                                <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                                  [{rIdx + 1}]
                                </span>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
