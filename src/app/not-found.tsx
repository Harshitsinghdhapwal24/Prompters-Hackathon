import React from 'react';
import Link from 'next/link';
import { Compass, Home, BookOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="py-24 text-center max-w-md mx-auto space-y-4 px-4">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400 shadow-subtle">
        <Compass className="w-7 h-7" aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          404 — Page Not Found
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          The study material, lecture, or view you requested does not exist or has been relocated.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-subtle transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Return to Dashboard Home"
        >
          <Home className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/lectures"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-subtle transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Browse all saved lectures"
        >
          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
          <span>My Lectures</span>
        </Link>
      </div>
    </div>
  );
}
