'use client';

import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Layers,
} from 'lucide-react';
import { Flashcard, Lecture } from '@/types/lecture';
import { updateLecture } from '@/lib/storage';

interface FlashcardsViewerProps {
  lecture: Lecture;
  onUpdateLecture?: (updated: Lecture) => void;
}

export default function FlashcardsViewer({ lecture, onUpdateLecture }: FlashcardsViewerProps) {
  const [cards, setCards] = useState<Flashcard[]>(lecture.flashcards || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setCards(lecture.flashcards || []);
  }, [lecture]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, cards.length]);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  };

  const toggleMastered = (cardId: string) => {
    const updatedCards = cards.map((c) => (c.id === cardId ? { ...c, mastered: !c.mastered } : c));
    setCards(updatedCards);
    const updatedLecture = { ...lecture, flashcards: updatedCards };
    updateLecture(updatedLecture);
    if (onUpdateLecture) onUpdateLecture(updatedLecture);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const handleResetProgress = () => {
    const resetCards = cards.map((c) => ({ ...c, mastered: false }));
    setCards(resetCards);
    const updatedLecture = { ...lecture, flashcards: resetCards };
    updateLecture(updatedLecture);
    if (onUpdateLecture) onUpdateLecture(updatedLecture);
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800">
        <Layers className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2.5" />
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          No Flashcards Generated
        </h4>
        <p className="text-xs text-slate-400 mt-1">
          Flashcards are synthesized automatically during lecture processing.
        </p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const masteredCount = cards.filter((c) => c.mastered).length;
  const progressPercent = Math.round((masteredCount / cards.length) * 100);

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Top Controls & Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
              Card {currentIndex + 1}/{cards.length}
            </span>
            <span>
              {masteredCount} of {cards.length} Mastered ({progressPercent}%)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShuffle}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Shuffle Cards"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetProgress}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Reset Progress"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3D Flipping Card Container */}
      <div
        className="perspective-1000 cursor-pointer min-h-[300px] sm:min-h-[340px]"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full min-h-[300px] sm:min-h-[340px] rounded-2xl transition-transform duration-500 transform-style-3d shadow-subtle hover:shadow-elevated ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT (Question) */}
          <div className="absolute inset-0 w-full h-full p-7 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 backface-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                {currentCard.category}
              </span>
              <span className="text-[11px] font-medium text-slate-400">Prompt</span>
            </div>

            <div className="my-auto py-3 text-center">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
                {currentCard.front}
              </h3>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
              <span>Click or [Space] to reveal answer</span>
              <span className="capitalize px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                {currentCard.difficulty}
              </span>
            </div>
          </div>

          {/* BACK (Answer) */}
          <div className="absolute inset-0 w-full h-full p-7 rounded-2xl bg-slate-900 text-white border border-slate-750 backface-hidden rotate-y-180 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Key Answer
              </span>
              <span className="text-[11px] font-medium text-slate-400">Solution</span>
            </div>

            <div className="my-auto py-3">
              <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal">
                {currentCard.back}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              <span>Click or [Space] to flip back</span>
              <span className="font-mono text-[10px]">LectureLens</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation & Action Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handlePrev}
          className="p-2.5 rounded-xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-subtle transition-all"
          title="Previous (Left Arrow)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => toggleMastered(currentCard.id)}
          className={`flex-1 py-2 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all ${
            currentCard.mastered
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-subtle'
              : 'bg-white dark:bg-[#0e1422] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-subtle'
          }`}
        >
          <CheckCircle2
            className={`w-3.5 h-3.5 ${currentCard.mastered ? 'text-white' : 'text-slate-400'}`}
          />
          {currentCard.mastered ? 'Mastered' : 'Mark Mastered'}
        </button>

        <button
          onClick={handleNext}
          className="p-2.5 rounded-xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-subtle transition-all"
          title="Next (Right Arrow)"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="text-center text-[11px] text-slate-400 space-x-2">
        <span>[Space] Flip</span>
        <span>•</span>
        <span>[←] Previous</span>
        <span>•</span>
        <span>[→] Next</span>
      </div>
    </div>
  );
}
