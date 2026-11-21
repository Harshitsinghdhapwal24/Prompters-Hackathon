'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  FileText,
  Layers,
  HelpCircle,
  Download,
  Trash2,
  Clock,
  Sparkles,
  Volume2,
  Video,
  FileCode,
  ArrowRight,
} from 'lucide-react';
import { Lecture, SourceType } from '@/types/lecture';
import { exportLectureToPdf } from '@/lib/pdfGenerator';
import { deleteLecture } from '@/lib/storage';

interface RecentLecturesProps {
  lectures: Lecture[];
  onLectureDeleted?: (id: string) => void;
}

export default function RecentLectures({ lectures, onLectureDeleted }: RecentLecturesProps) {
  const getSourceIcon = (type: SourceType) => {
    switch (type) {
      case 'audio':
        return <Volume2 className="w-3.5 h-3.5 text-purple-500" />;
      case 'video':
        return <Video className="w-3.5 h-3.5 text-blue-500" />;
      case 'pdf':
        return <FileText className="w-3.5 h-3.5 text-red-500" />;
      default:
        return <FileCode className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteLecture(id);
      if (onLectureDeleted) onLectureDeleted(id);
    }
  };

  const handlePdfExport = (e: React.MouseEvent, lecture: Lecture) => {
    e.preventDefault();
    e.stopPropagation();
    exportLectureToPdf(lecture);
  };

  if (!lectures || lectures.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
        <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          No lectures processed yet
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
          Upload your first classroom audio, video, PDF or paste a lecture transcript to generate
          study materials in seconds.
        </p>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Upload Lecture Now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {lectures.map((lec) => {
        const masteredCards = lec.flashcards?.filter((f) => f.mastered).length || 0;
        const totalCards = lec.flashcards?.length || 0;

        return (
          <div
            key={lec.id}
            className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
          >
            {/* Left: Metadata & Title */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800/50">
                  {getSourceIcon(lec.sourceType)}
                  {lec.subject}
                </span>

                <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                  <Clock className="w-3 h-3" />
                  {lec.durationMinutes || 45} mins
                </span>

                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  • {new Date(lec.createdAt).toLocaleDateString()}
                </span>
              </div>

              <Link
                href={`/lectures/${lec.id}`}
                className="block group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
              >
                <h4 className="text-base font-semibold text-slate-900 dark:text-white truncate">
                  {lec.title}
                </h4>
              </Link>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-2xl">
                {lec.summary?.tldr || 'Complete study notes and examination guide.'}
              </p>
            </div>

            {/* Right: Action Badges & Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
              <Link
                href={`/lectures/${lec.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800/50 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                Notes
              </Link>

              <Link
                href={`/lectures/${lec.id}?tab=flashcards`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                Cards ({masteredCards}/{totalCards})
              </Link>

              <Link
                href={`/lectures/${lec.id}?tab=quiz`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
                Quiz ({lec.quiz?.length || 0})
              </Link>

              <button
                onClick={(e) => handlePdfExport(e, lec)}
                title="Download PDF Study Guide"
                className="p-2 rounded-xl text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => handleDelete(e, lec.id, lec.title)}
                title="Delete Lecture"
                className="p-2 rounded-xl text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <Link
                href={`/lectures/${lec.id}`}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
