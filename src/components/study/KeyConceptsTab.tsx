'use client';

import React, { useState } from 'react';
import { Search, Tag, Calculator } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter concepts & formulas..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        {/* Priority Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {(['all', 'high', 'medium', 'low'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                filterPriority === p
                  ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-subtle'
                  : 'bg-white dark:bg-[#0e1422] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Formulas Section */}
      {filteredFormulas.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Calculator className="w-3.5 h-3.5 text-indigo-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Governing Mathematical Formulas
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredFormulas.map((f) => (
              <div
                key={f.id}
                className="p-4 rounded-xl bg-white dark:bg-[#0e1422] border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-white">{f.name}</h4>
                  {f.units && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {f.units}
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center font-mono text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 overflow-x-auto">
                  {f.formula}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {f.description}
                </p>

                {f.variables && f.variables.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Variable Key:
                    </span>
                    <div className="grid grid-cols-1 gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                      {f.variables.map((v, idx) => (
                        <div key={idx} className="flex items-baseline gap-1.5">
                          <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
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
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-slate-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Key Concepts ({filteredConcepts.length})
          </h3>
        </div>

        {filteredConcepts.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#0e1422] rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            No concepts match the selected filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredConcepts.map((kc) => {
              const priorityBadge =
                kc.importance === 'high'
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-900/40'
                  : kc.importance === 'medium'
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/40'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';

              return (
                <div
                  key={kc.id}
                  className="p-4 rounded-xl bg-white dark:bg-[#0e1422] border border-slate-200/80 dark:border-slate-800/80 shadow-subtle hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {kc.category}
                      </span>
                      <span
                        className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded border ${priorityBadge}`}
                      >
                        {kc.importance}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {kc.term}
                    </h4>

                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {kc.definition}
                    </p>
                  </div>

                  {kc.example && (
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Application:
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
