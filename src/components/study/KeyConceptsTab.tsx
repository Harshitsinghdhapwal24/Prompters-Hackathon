'use client';

import React, { useState } from 'react';
import { Search, Tag, Calculator, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { KeyConcept, Formula } from '@/types/lecture';

interface KeyConceptsTabProps {
  keyConcepts: KeyConcept[];
  formulas: Formula[];
}

export default function KeyConceptsTab({ keyConcepts, formulas }: KeyConceptsTabProps) {
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filteredConcepts = (keyConcepts || []).filter((kc) => {
    const matchesSearch =
      kc.term.toLowerCase().includes(search.toLowerCase()) ||
      kc.definition.toLowerCase().includes(search.toLowerCase()) ||
      kc.category.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = filterPriority === 'all' || kc.importance === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const filteredFormulas = (formulas || []).filter((f) => {
    return (
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase()) ||
      f.formula.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter concepts & formulas..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        {/* Priority Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {(['all', 'high', 'medium', 'low'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filterPriority === p
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Formulas Section (If present) */}
      {filteredFormulas.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Governing Mathematical Formulas
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFormulas.map((f) => (
              <div
                key={f.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{f.name}</h4>
                  {f.units && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {f.units}
                    </span>
                  )}
                </div>

                {/* Formula equation banner */}
                <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/50 text-center font-mono text-sm sm:text-base font-semibold text-purple-700 dark:text-purple-300 overflow-x-auto">
                  {f.formula}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {f.description}
                </p>

                {/* Variable Breakdown */}
                {f.variables && f.variables.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Variable Key:
                    </span>
                    <div className="grid grid-cols-1 gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                      {f.variables.map((v, idx) => (
                        <div key={idx} className="flex items-baseline gap-2">
                          <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">
                            {v.symbol}:
                          </span>
                          <span>{v.explanation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Concepts Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            High-Yield Concepts & Glossary ({filteredConcepts.length})
          </h3>
        </div>

        {filteredConcepts.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            No concepts match the selected filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredConcepts.map((kc) => {
              const priorityColor =
                kc.importance === 'high'
                  ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-900/40'
                  : kc.importance === 'medium'
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/40'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';

              return (
                <div
                  key={kc.id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:border-purple-300 dark:hover:border-purple-800/60 transition-all space-y-2.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                        {kc.category}
                      </span>
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${priorityColor}`}
                      >
                        {kc.importance} priority
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {kc.term}
                    </h4>

                    <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {kc.definition}
                    </p>
                  </div>

                  {kc.example && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-500 dark:text-slate-400 italic">
                      <span className="font-semibold not-italic text-slate-700 dark:text-slate-300">
                        Example / Application:
                      </span>{' '}
                      {kc.example}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
