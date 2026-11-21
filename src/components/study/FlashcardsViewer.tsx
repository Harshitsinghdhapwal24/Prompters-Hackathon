'use client';

import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Sparkles,
  Layers,
  HelpCircle,
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
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
      <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
        <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Controls & Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <span className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/50">
              Card {currentIndex + 1} of {cards.length}
            </span>
            <span>
              {masteredCount} of {cards.length} Mastered ({progressPercent}%)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffle}
              className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Shuffle Cards"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetProgress}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Reset Mastery"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3D Flipping Card Container */}
      <div
        className="perspective-1000 cursor-pointer min-h-[320px] sm:min-h-[360px]"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full min-h-[320px] sm:min-h-[360px] rounded-3xl transition-transform duration-500 transform-style-3d shadow-md hover:shadow-xl ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT OF CARD (Question) */}
          <div className="absolute inset-0 w-full h-full p-8 rounded-3xl bg-white dark:bg-[#111827] border-2 border-purple-200/80 dark:border-purple-900/60 backface-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800/50">
                {currentCard.category}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">Question</span>
            </div>

            <div className="my-auto py-4 text-center">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentCard.front}
              </h3>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-400">
              <span>Click or Press [Space] to flip</span>
              <span className="capitalize text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {currentCard.difficulty}
              </span>
            </div>
          </div>

          {/* BACK OF CARD (Answer) */}
          <div className="absolute inset-0 w-full h-full p-8 rounded-3xl bg-gradient-to-br from-purple-900/90 via-indigo-950 to-slate-950 text-white border-2 border-purple-500/80 backface-hidden rotate-y-180 flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/40">
                Answer & Key Insight
              </span>
              <Sparkles className="w-4 h-4 text-purple-300" />
            </div>

            <div className="my-auto py-4">
              <p className="text-base sm:text-lg text-purple-50 leading-relaxed font-medium">
                {currentCard.back}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-purple-800/50 text-xs text-purple-200">
              <span>Click or Press [Space] to flip back</span>
              <span className="font-mono text-[11px]">LectureLens AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation & Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          className="p-3 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm transition-all hover:scale-105"
          title="Previous Card (Left Arrow)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => toggleMastered(currentCard.id)}
          className={`flex-1 py-3 px-6 rounded-2xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            currentCard.mastered
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white dark:bg-[#111827] hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <CheckCircle2
            className={`w-4 h-4 ${currentCard.mastered ? 'text-white' : 'text-slate-400'}`}
          />
          {currentCard.mastered ? 'Mastered! Click to unmark' : 'Mark as Mastered'}
        </button>

        <button
          onClick={handleNext}
          className="p-3 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm transition-all hover:scale-105"
          title="Next Card (Right Arrow)"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 space-x-3">
        <span>[Space] Flip</span>
        <span>•</span>
        <span>[←] Previous</span>
        <span>•</span>
        <span>[→] Next</span>
      </div>
    </div>
  );
}
