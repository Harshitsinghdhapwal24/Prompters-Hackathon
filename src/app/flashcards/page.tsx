'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layers, ArrowRight } from 'lucide-react';
import { getStoredLectures } from '@/lib/storage';
import { Lecture } from '@/types/lecture';
import FlashcardsViewer from '@/components/study/FlashcardsViewer';

export default function FlashcardsHubPage() {
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

  const totalAllCards = lectures.reduce((acc, l) => acc + (l.flashcards?.length || 0), 0);
  const totalMastered = lectures.reduce(
    (acc, l) => acc + (l.flashcards?.filter((f) => f.mastered)?.length || 0),
    0
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Layers className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Recall
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Flashcards Revision Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {totalMastered} of {totalAllCards} cards mastered across all courses.
          </p>
        </div>
      </div>

      {/* Deck Selector Pills */}
      {lectures.length > 0 && (
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#0e1422] rounded-xl border border-slate-200/80 dark:border-slate-800/80 overflow-x-auto scrollbar-none shadow-subtle">
          {lectures.map((lec) => {
            const isSelected = lec.id === selectedLecture?.id;
            const mastered = lec.flashcards?.filter((f) => f.mastered).length || 0;
            const total = lec.flashcards?.length || 0;

            return (
              <button
                key={lec.id}
                onClick={() => setSelectedId(lec.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-subtle'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{lec.subject}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  {mastered}/{total}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {selectedLecture ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 shadow-subtle flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Deck: {selectedLecture.subject}
              </span>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                {selectedLecture.title}
              </h3>
            </div>
            <Link
              href={`/lectures/${selectedLecture.id}`}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Full Study Guide <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <FlashcardsViewer
            lecture={selectedLecture}
            onUpdateLecture={(updated) => {
              setLectures((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
            }}
          />
        </div>
      ) : (
        <div className="p-8 text-center bg-white dark:bg-[#0e1422] rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
          No flashcards available.
        </div>
      )}
    </div>
  );
}
