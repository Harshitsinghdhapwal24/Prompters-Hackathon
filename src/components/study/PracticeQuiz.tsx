'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  ArrowRight,
  Info,
} from 'lucide-react';
import { QuizQuestion } from '@/types/lecture';

interface PracticeQuizProps {
  quiz: QuizQuestion[];
}

export default function PracticeQuiz({ quiz }: PracticeQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  if (!quiz || quiz.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
        <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          No Quiz Questions Generated
        </h4>
        <p className="text-xs text-slate-400 mt-1">
          Practice questions are generated during lecture analysis.
        </p>
      </div>
    );
  }

  const currentQ = quiz[currentIndex];
  const isAnswered = selectedAnswers[currentIndex] !== undefined;
  const userAnswer = selectedAnswers[currentIndex];
  const isCorrect = isAnswered && userAnswer === currentQ.correctAnswerIndex;

  const handleSelectOption = (optionIndex: number) => {
    if (isAnswered) return; // Prevent re-selection once answered
    const updated = { ...selectedAnswers, [currentIndex]: optionIndex };
    setSelectedAnswers(updated);

    // If this was the last question, celebrate with confetti!
    if (Object.keys(updated).length === quiz.length) {
      setTimeout(() => {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {
          // ignore
        }
      }, 500);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctAnswerIndex) correct++;
    });
    return correct;
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setShowResults(false);
  };

  const score = calculateScore();
  const percentage = Math.round((score / quiz.length) * 100);

  // If showing full results overview
  if (showResults) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Results Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white text-center shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto shadow-inner">
            <Trophy className="w-8 h-8 text-amber-300 animate-bounce" />
          </div>

          <h3 className="text-2xl font-extrabold tracking-tight">Quiz Complete!</h3>
          <p className="text-sm text-purple-100 max-w-sm mx-auto">
            {percentage >= 80
              ? 'Outstanding performance! You have high conceptual mastery.'
              : percentage >= 60
              ? 'Good effort! Review the explanations below to solidify difficult areas.'
              : 'Keep studying! Go over the study notes and flashcards before retrying.'}
          </p>

          <div className="flex items-center justify-center gap-6 pt-2">
            <div>
              <div className="text-3xl font-black">{score}/{quiz.length}</div>
              <div className="text-xs text-purple-200">Total Score</div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <div className="text-3xl font-black">{percentage}%</div>
              <div className="text-xs text-purple-200">Accuracy</div>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-purple-700 font-bold text-xs shadow-md hover:bg-purple-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Retake Practice Quiz
          </button>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Question Review & Explanations
          </h4>

          {quiz.map((q, idx) => {
            const userChoice = selectedAnswers[idx];
            const wasCorrect = userChoice === q.correctAnswerIndex;

            return (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Q{idx + 1}: {q.question}
                  </span>
                  {wasCorrect ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md">
                      <XCircle className="w-3.5 h-3.5" /> Incorrect
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs">
                  {q.options.map((opt, oIdx) => {
                    const isRight = oIdx === q.correctAnswerIndex;
                    const isPicked = oIdx === userChoice;

                    return (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between ${
                          isRight
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-medium'
                            : isPicked
                            ? 'bg-red-50/70 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200'
                            : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span>
                          {String.fromCharCode(65 + oIdx)}) {opt}
                        </span>
                        {isRight && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        {isPicked && !isRight && <XCircle className="w-3.5 h-3.5 text-red-500" />}
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 text-xs text-purple-900 dark:text-purple-200">
                  <span className="font-semibold">Explanation:</span> {q.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Quiz Header & Tracker */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800/50">
          Question {currentIndex + 1} of {quiz.length}
        </span>

        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Topic: {currentQ.topic}
        </span>
      </div>

      {/* Question Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
          {currentQ.question}
        </h3>

        {/* Options List */}
        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            const isSelected = userAnswer === idx;
            const isTheCorrectAnswer = idx === currentQ.correctAnswerIndex;

            let cardStyle =
              'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800 text-slate-800 dark:text-slate-200';

            if (isAnswered) {
              if (isTheCorrectAnswer) {
                cardStyle =
                  'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-semibold shadow-sm';
              } else if (isSelected) {
                cardStyle =
                  'bg-red-50 dark:bg-red-950/40 border-red-400 dark:border-red-700 text-red-900 dark:text-red-200';
              } else {
                cardStyle = 'opacity-50 border-slate-200 dark:border-slate-800';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswered}
                className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${cardStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-purple-600 dark:text-purple-400 border border-slate-200 dark:border-slate-700">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option}</span>
                </div>

                {isAnswered && isTheCorrectAnswer && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                )}
                {isAnswered && isSelected && !isTheCorrectAnswer && (
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Immediate Explanation Banner */}
        {isAnswered && (
          <div
            className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1 animate-fade-in ${
              isCorrect
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200'
                : 'bg-purple-50/80 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/50 text-purple-900 dark:text-purple-200'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <Info className="w-4 h-4" />
              <span>{isCorrect ? 'Correct Answer!' : 'Explanation:'}</span>
            </div>
            <p>{currentQ.explanation}</p>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
          disabled={currentIndex === 0}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous Question
        </button>

        {currentIndex < quiz.length - 1 ? (
          <button
            onClick={() => setCurrentIndex((p) => p + 1)}
            disabled={!isAnswered}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            Next Question <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={() => setShowResults(true)}
            disabled={!isAnswered}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            View Complete Results <Trophy className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
