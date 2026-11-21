'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  Sparkles,
  ArrowRight,
  BookOpen,
  Zap,
} from 'lucide-react';
import StatCards from '@/components/dashboard/StatCards';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentLectures from '@/components/dashboard/RecentLectures';
import { getStoredLectures } from '@/lib/storage';
import { Lecture } from '@/types/lecture';

export default function DashboardPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const data = getStoredLectures();
      setLectures(data);
    };

    loadData();
    setMounted(true);

    window.addEventListener('lecturelens_storage_updated', loadData);
    return () => window.removeEventListener('lecturelens_storage_updated', loadData);
  }, []);

  const handleLectureDeleted = (id: string) => {
    setLectures((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-purple-900/90 via-indigo-950 to-slate-950 border border-purple-800/40 text-white overflow-hidden shadow-xl">
        {/* Glow overlay */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            <span>AI-Powered Study Assistant</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Turn lectures into <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-indigo-200 to-blue-300">learning.</span>
          </h1>

          <p className="text-sm sm:text-base text-purple-100/90 font-medium leading-relaxed">
            Your AI study companion. Transform messy classroom recordings, audio, videos, and slides into structured study notes, active recall flashcards, and exam-grade quizzes in seconds.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/30 transition-all hover:scale-105 active:scale-95 group"
            >
              <UploadCloud className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              Upload Lecture
            </Link>

            <Link
              href="/lectures/lec-cs-182"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-xs sm:text-sm bg-white/10 hover:bg-white/15 text-purple-100 border border-white/10 backdrop-blur-md transition-all hover:scale-105"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              Try Demo Lecture (CS 182)
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Counter Section */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Learning Analytics & Progress
        </h2>
        <StatCards lectures={lectures} />
      </section>

      {/* Quick Action Cards */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Quick Study Actions
        </h2>
        <QuickActions />
      </section>

      {/* Recent Lectures Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Lectures
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pick up where you left off or generate revision decks
            </p>
          </div>

          <Link
            href="/lectures"
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
          >
            View All ({lectures.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <RecentLectures lectures={lectures} onLectureDeleted={handleLectureDeleted} />
      </section>
    </div>
  );
}
