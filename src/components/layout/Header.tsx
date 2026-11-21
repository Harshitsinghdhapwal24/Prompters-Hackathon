'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, PlusCircle, BookOpen } from 'lucide-react';
import { getStoredLectures } from '@/lib/storage';

export default function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const lectures = getStoredLectures();
    const filtered = lectures.filter(
      (l) =>
        l.title.toLowerCase().includes(q.toLowerCase()) ||
        l.subject.toLowerCase().includes(q.toLowerCase()) ||
        l.summary.tldr.toLowerCase().includes(q.toLowerCase())
    );
    setResults(filtered);
    setIsOpen(true);
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/90 dark:bg-[#090d16]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 flex items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md ml-12 lg:ml-0" role="search">
        <label htmlFor="global-search-input" className="sr-only">
          Search lectures, topics, concepts
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
          <input
            id="global-search-input"
            type="search"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search lectures, topics, concepts..."
            aria-label="Search lectures, topics, and concepts"
            className="w-full pl-9 pr-12 py-1.5 text-xs sm:text-sm bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400" aria-hidden="true">
            ⌘K
          </kbd>
        </div>

        {/* Live Search Results Dropdown */}
        {isOpen && (
          <div
            role="region"
            aria-label="Search results"
            aria-live="polite"
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50"
          >
            {results.length === 0 ? (
              <div className="p-4 text-xs text-slate-500 text-center">
                No matching lectures found for &quot;{searchQuery}&quot;
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setIsOpen(false);
                      setSearchQuery('');
                      router.push(`/lectures/${r.id}`);
                    }}
                    className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    aria-label={`Open lecture: ${r.title}`}
                  >
                    <BookOpen className="w-4 h-4 text-indigo-500 flex-shrink-0" aria-hidden="true" />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {r.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{r.subject}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/upload"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-subtle transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Upload new lecture"
        >
          <PlusCircle className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Upload Lecture</span>
        </Link>
      </div>
    </header>
  );
}
