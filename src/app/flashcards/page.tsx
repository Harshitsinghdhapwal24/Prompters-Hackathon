'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layers, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Active Recall Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Flashcards Revision Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {totalMastered} of {totalAllCards} cards mastered across all decks.
          </p>
        </div>
      </div>

      {/* Deck Selector Pills */}
      {lectures.length > 0 && (
        <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-x-auto scrollbar-none shadow-sm">
          {lectures.map((lec) => {
            const isSelected = lec.id === selectedLecture?.id;
            const mastered = lec.flashcards?.filter((f) => f.mastered).length || 0;
            const total = lec.flashcards?.length || 0;

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
                  {mastered}/{total}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Deck Flashcards Viewer */}
      {selectedLecture ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase">
                Active Deck: {selectedLecture.subject}
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

          <FlashcardsViewer
            lecture={selectedLecture}
            onUpdateLecture={(updated) => {
              setLectures((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
            }}
          />
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500">No lecture flashcards available.</p>
        </div>
      )}
    </div>
  );
}
