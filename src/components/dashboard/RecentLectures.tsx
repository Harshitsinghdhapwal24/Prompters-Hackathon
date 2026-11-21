'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  Layers,
  HelpCircle,
  Download,
  Trash2,
  Clock,
  Volume2,
  Video,
  FileCode,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { YoutubeIcon } from '@/components/icons/YoutubeIcon';
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
      case 'youtube':
        return <YoutubeIcon className="w-3.5 h-3.5 text-rose-500" />;
      case 'audio':
        return <Volume2 className="w-3.5 h-3.5 text-indigo-500" />;
      case 'video':
        return <Video className="w-3.5 h-3.5 text-blue-500" />;
      case 'pdf':
        return <FileText className="w-3.5 h-3.5 text-amber-500" />;
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
      <div className="p-8 text-center rounded-xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800">
        <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2.5" />
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          No lectures processed yet
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
          Paste a YouTube link or upload classroom audio/video to generate your first study package.
        </p>
        <Link
          href="/upload"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-subtle transition-colors"
        >
          Process Lecture Now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {lectures.map((lec) => {
        const masteredCards = lec.flashcards?.filter((f) => f.mastered).length || 0;
        const totalCards = lec.flashcards?.length || 0;

        return (
          <div
            key={lec.id}
            className="p-4 rounded-xl bg-white dark:bg-[#0e1422] border border-slate-200/80 dark:border-slate-800/80 shadow-subtle hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-3 group"
          >
            {/* Left: Metadata & Title */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-750">
                  {getSourceIcon(lec.sourceType)}
                  {lec.sourceType === 'youtube' ? 'YouTube' : lec.subject}
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
                className="block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
              >
                <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate">
                  {lec.title}
                </h4>
              </Link>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-2xl">
                {lec.summary?.tldr || 'Complete study notes and examination guide.'}
              </p>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
              <Link
                href={`/lectures/${lec.id}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Notes
              </Link>

              <Link
                href={`/lectures/${lec.id}?tab=flashcards`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                Cards ({masteredCards}/{totalCards})
              </Link>

              <Link
                href={`/lectures/${lec.id}?tab=quiz`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
                Quiz ({lec.quiz?.length || 0})
              </Link>

              <button
                onClick={(e) => handlePdfExport(e, lec)}
                title="Download PDF Study Guide"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => handleDelete(e, lec.id, lec.title)}
                title="Delete Lecture"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <Link
                href={`/lectures/${lec.id}`}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
