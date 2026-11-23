'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
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
      <div className="p-8 text-center rounded-xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800">
        <HelpCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2.5" />
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
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
    if (isAnswered) return;
    const updated = { ...selectedAnswers, [currentIndex]: optionIndex };
    setSelectedAnswers(updated);

    if (Object.keys(updated).length === quiz.length) {
      setTimeout(() => {
        import('canvas-confetti')
          .then((m) => {
            const fireConfetti = m.default;
            fireConfetti({
              particleCount: 70,
              spread: 60,
              origin: { y: 0.6 },
            });
          })
          .catch(() => {
            // Ignore if canvas-confetti fails or is unavailable in test environment
          });
      }, 400);
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

  if (showResults) {
    return (
      <div className="max-w-xl mx-auto space-y-5">
        {/* Results Banner */}
        <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 text-center shadow-elevated space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto border border-slate-700">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>

          <h3 className="text-lg font-bold tracking-tight">Quiz Complete</h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto">
            {percentage >= 80
              ? 'Excellent conceptual understanding demonstrated.'
              : percentage >= 60
              ? 'Good effort. Review the explanations below to reinforce weaker areas.'
              : 'Review your study notes and flashcards before retrying.'}
          </p>

          <div className="flex items-center justify-center gap-6 pt-1">
            <div>
              <div className="text-2xl font-bold">{score}/{quiz.length}</div>
              <div className="text-[11px] text-slate-400">Score</div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <div className="text-2xl font-bold">{percentage}%</div>
              <div className="text-[11px] text-slate-400">Accuracy</div>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-slate-900 font-semibold text-xs shadow-subtle hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
          </button>
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Question Review
          </h4>

          {quiz.map((q, idx) => {
            const userChoice = selectedAnswers[idx];
            const wasCorrect = userChoice === q.correctAnswerIndex;

            return (
              <div
                key={q.id}
                className="p-4 rounded-xl bg-white dark:bg-[#0e1422] border border-slate-200/80 dark:border-slate-800/80 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    Q{idx + 1}: {q.question}
                  </span>
                  {wasCorrect ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" /> Correct
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
                      <XCircle className="w-3 h-3" /> Incorrect
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs">
                  {q.options.map((opt, oIdx) => {
                    const isRight = oIdx === q.correctAnswerIndex;
                    const isPicked = oIdx === userChoice;

                    return (
                      <div
                        key={oIdx}
                        className={`p-2 rounded-lg border flex items-center justify-between text-xs ${
                          isRight
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-medium'
                            : isPicked
                            ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span>
                          {String.fromCharCode(65 + oIdx)}) {opt}
                        </span>
                        {isRight && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        {isPicked && !isRight && <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                      </div>
                    );
                  })}
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Explanation:</span> {q.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Tracker */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          Question {currentIndex + 1} of {quiz.length}
        </span>

        <span className="text-xs text-slate-400">
          {currentQ.topic}
        </span>
      </div>

      {/* Question Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-4">
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
          {currentQ.question}
        </h3>

        {/* Options */}
        <div className="space-y-2">
          {currentQ.options.map((option, idx) => {
            const isSelected = userAnswer === idx;
            const isTheCorrectAnswer = idx === currentQ.correctAnswerIndex;

            let cardStyle =
              'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200';

            if (isAnswered) {
              if (isTheCorrectAnswer) {
                cardStyle =
                  'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-medium shadow-subtle';
              } else if (isSelected) {
                cardStyle =
                  'bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-700 text-rose-900 dark:text-rose-200';
              } else {
                cardStyle = 'opacity-50 border-slate-200 dark:border-slate-800';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswered}
                className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-2.5 ${cardStyle}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-white dark:bg-slate-800 flex items-center justify-center font-semibold text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option}</span>
                </div>

                {isAnswered && isTheCorrectAnswer && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                )}
                {isAnswered && isSelected && !isTheCorrectAnswer && (
                  <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Immediate Feedback Explanation */}
        {isAnswered && (
          <div
            className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-1 animate-fade-in ${
              isCorrect
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 font-semibold">
              <Info className="w-3.5 h-3.5" />
              <span>{isCorrect ? 'Correct' : 'Explanation'}</span>
            </div>
            <p>{currentQ.explanation}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
          disabled={currentIndex === 0}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {currentIndex < quiz.length - 1 ? (
          <button
            onClick={() => setCurrentIndex((p) => p + 1)}
            disabled={!isAnswered}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-subtle transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            Next <ArrowRight className="w-3 h-3" />
          </button>
        ) : (
          <button
            onClick={() => setShowResults(true)}
            disabled={!isAnswered}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-subtle transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            View Results <Trophy className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
