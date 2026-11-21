'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  PlusCircle,
  ArrowUpDown,
} from 'lucide-react';
import { getStoredLectures } from '@/lib/storage';
import { Lecture } from '@/types/lecture';
import RecentLectures from '@/components/dashboard/RecentLectures';

export default function MyLecturesPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'duration' | 'title'>('newest');

  useEffect(() => {
    const loadData = () => {
      setLectures(getStoredLectures());
    };
    loadData();

    window.addEventListener('lecturelens_storage_updated', loadData);
    return () => window.removeEventListener('lecturelens_storage_updated', loadData);
  }, []);

  const subjects = ['All', ...Array.from(new Set(lectures.map((l) => l.subject)))];

  const filteredLectures = lectures
    .filter((lec) => {
      const matchesSearch =
        lec.title.toLowerCase().includes(search.toLowerCase()) ||
        lec.subject.toLowerCase().includes(search.toLowerCase()) ||
        lec.summary.tldr.toLowerCase().includes(search.toLowerCase());
      const matchesSubject = selectedSubject === 'All' || lec.subject === selectedSubject;
      return matchesSearch && matchesSubject;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'duration') {
        return (b.durationMinutes || 0) - (a.durationMinutes || 0);
      }
      return a.title.localeCompare(b.title);
    });

  const handleDeleted = (id: string) => {
    setLectures((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            My Lectures
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your classroom recordings, review notes, and study decks.
          </p>
        </div>

        <Link
          href="/upload"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-subtle transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5" /> Upload Lecture
        </Link>
      </div>

      <div className="p-3.5 rounded-xl bg-white dark:bg-[#0e1422] border border-slate-200/80 dark:border-slate-800/80 shadow-subtle flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lectures..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedSubject === sub
                  ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-subtle'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1 text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="newest">Sort: Newest</option>
            <option value="duration">Sort: Duration</option>
            <option value="title">Sort: Title</option>
          </select>
        </div>
      </div>

      <RecentLectures lectures={filteredLectures} onLectureDeleted={handleDeleted} />
    </div>
  );
}
