'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  Sparkles,
  ArrowRight,
  BookOpen,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import StatCards from '@/components/dashboard/StatCards';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentLectures from '@/components/dashboard/RecentLectures';
import { getStoredLectures } from '@/lib/storage';
import { Lecture } from '@/types/lecture';

export default function DashboardPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);

  useEffect(() => {
    const loadData = () => {
      const data = getStoredLectures();
      setLectures(data);
    };

    loadData();

    window.addEventListener('lecturelens_storage_updated', loadData);
    return () => window.removeEventListener('lecturelens_storage_updated', loadData);
  }, []);

  const handleLectureDeleted = (id: string) => {
    setLectures((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Sleek Professional Hero Banner */}
      <div className="relative rounded-2xl p-6 sm:p-10 bg-slate-900 text-white border border-slate-800 shadow-elevated overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>AI Lecture Intelligence Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Turn lectures into <span className="text-indigo-400">learning.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Your AI study companion. Convert lengthy classroom audio, videos, and slides into structured study notes, active recall flashcards, and exam-grade quizzes.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-subtle transition-all duration-150 group"
            >
              <UploadCloud className="w-4 h-4" />
              Upload Lecture
            </Link>

            <Link
              href="/lectures/lec-cs-182"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-all duration-150"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Explore Sample (CS 182)
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Learning Metrics & Status
        </h2>
        <StatCards lectures={lectures} />
      </section>

      {/* Quick Actions */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Core Workflows
        </h2>
        <QuickActions />
      </section>

      {/* Recent Lectures Feed */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Recent Lectures
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Continue your study modules or export PDF summaries
            </p>
          </div>

          <Link
            href="/lectures"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
          >
            All Lectures ({lectures.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <RecentLectures lectures={lectures} onLectureDeleted={handleLectureDeleted} />
      </section>
    </div>
  );
}
