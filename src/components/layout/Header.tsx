'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, PlusCircle, Sparkles, BookOpen } from 'lucide-react';
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
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 flex items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md ml-12 lg:ml-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search lectures, topics, concepts..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all"
          />
        </div>

        {/* Live Search Results Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
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
                    className="w-full text-left p-3 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition-colors flex items-center gap-3"
                  >
                    <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <div className="truncate">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {r.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{r.subject}</p>
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
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-sm shadow-purple-500/20 transition-all hover:scale-[1.02]"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Upload Lecture</span>
        </Link>
      </div>
    </header>
  );
}
