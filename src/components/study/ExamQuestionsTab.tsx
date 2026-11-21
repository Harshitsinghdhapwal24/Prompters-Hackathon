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
      <div className="p-8 text-center rounded-xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800">
        <HelpCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2.5" />
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          No Exam Questions Available
        </h4>
        <p className="text-xs text-slate-400 mt-1">
          Exam questions with marking rubrics are generated during lecture synthesis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Short Answer */}
      {hasShort && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ListChecks className="w-3.5 h-3.5 text-slate-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Short Answer Problems ({shortAnswer.length})
            </h3>
          </div>

          <div className="space-y-2.5">
            {shortAnswer.map((q, idx) => {
              const isOpen = Boolean(openIds[q.id]);

              return (
                <div
                  key={q.id}
                  className="rounded-xl bg-white dark:bg-[#0e1422] border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-subtle transition-all"
                >
                  <button
                    onClick={() => toggleOpen(q.id)}
                    className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex-shrink-0 mt-0.5">
                        {q.marks} Marks
                      </span>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                        Q{idx + 1}: {q.question}
                      </h4>
                    </div>

                    <div className="p-1 rounded text-slate-400 flex-shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/80 space-y-3 text-xs bg-slate-50/50 dark:bg-slate-900/40">
                      <div className="space-y-1 pt-3">
                        <span className="font-bold uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400">
                          Model Answer:
                        </span>
                        <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                          {q.sampleAnswer}
                        </p>
                      </div>

                      {q.keyPoints && q.keyPoints.length > 0 && (
                        <div className="p-3 rounded-lg bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Required Criteria:
                          </span>
                          <div className="space-y-1">
                            {q.keyPoints.map((pt, pIdx) => (
                              <div
                                key={pIdx}
                                className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300"
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
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

      {/* Long Answer */}
      {hasLong && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-slate-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Long Answer & Derivations ({longAnswer.length})
            </h3>
          </div>

          <div className="space-y-2.5">
            {longAnswer.map((q, idx) => {
              const isOpen = Boolean(openIds[q.id]);

              return (
                <div
                  key={q.id}
                  className="rounded-xl bg-white dark:bg-[#0e1422] border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-subtle transition-all"
                >
                  <button
                    onClick={() => toggleOpen(q.id)}
                    className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex-shrink-0 mt-0.5">
                        {q.marks} Marks
                      </span>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                        Q{idx + 1}: {q.question}
                      </h4>
                    </div>

                    <div className="p-1 rounded text-slate-400 flex-shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/80 space-y-3 text-xs bg-slate-50/50 dark:bg-slate-900/40">
                      <div className="space-y-1 pt-3">
                        <span className="font-bold uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400">
                          Complete Derivation / Exemplary Solution:
                        </span>
                        <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                          {q.sampleAnswer}
                        </p>
                      </div>

                      {q.markingRubric && q.markingRubric.length > 0 && (
                        <div className="p-3 rounded-lg bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Examiner Marking Rubric:
                          </span>
                          <div className="space-y-1">
                            {q.markingRubric.map((item, rIdx) => (
                              <div
                                key={rIdx}
                                className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300"
                              >
                                <span className="font-mono text-slate-400 font-semibold">
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
