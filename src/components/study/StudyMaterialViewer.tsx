'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Trash2,
  Share2,
  Check,
  Clock,
  Sparkles,
  FileText,
  Tag,
  Layers,
  HelpCircle,
  Award,
  FileCode,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { YoutubeIcon } from '@/components/icons/YoutubeIcon';
import { Lecture } from '@/types/lecture';
import { exportLectureToPdf } from '@/lib/pdfGenerator';
import { deleteLecture } from '@/lib/storage';
import { extractYouTubeId } from '@/lib/youtube';

import SummaryTab from './SummaryTab';
import StudyNotesTab from './StudyNotesTab';
import KeyConceptsTab from './KeyConceptsTab';
import FlashcardsViewer from './FlashcardsViewer';
import PracticeQuiz from './PracticeQuiz';
import ExamQuestionsTab from './ExamQuestionsTab';
import TranscriptTab from './TranscriptTab';

interface StudyMaterialViewerProps {
  initialLecture: Lecture;
  defaultTab?: string;
}

export default function StudyMaterialViewer({
  initialLecture,
  defaultTab = 'summary',
}: StudyMaterialViewerProps) {
  const router = useRouter();
  const [lecture, setLecture] = useState<Lecture>(initialLecture);
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  const youtubeId = lecture.youtubeUrl ? extractYouTubeId(lecture.youtubeUrl) : null;

  const tabs = [
    { id: 'summary', name: 'Executive Summary', icon: Sparkles },
    { id: 'notes', name: 'Study Notes', icon: FileText },
    { id: 'concepts', name: 'Concepts & Formulas', icon: Tag, count: (lecture.keyConcepts?.length || 0) + (lecture.formulas?.length || 0) },
    { id: 'flashcards', name: 'Flashcards', icon: Layers, count: lecture.flashcards?.length || 0 },
    { id: 'quiz', name: 'Practice Quiz', icon: HelpCircle, count: lecture.quiz?.length || 0 },
    { id: 'exam', name: 'Exam Questions', icon: Award, count: (lecture.examQuestions?.shortAnswer?.length || 0) + (lecture.examQuestions?.longAnswer?.length || 0) },
    { id: 'transcript', name: 'Transcript', icon: FileCode },
  ];

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${lecture.title}"?`)) {
      deleteLecture(lecture.id);
      router.push('/lectures');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Bar Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/lectures"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All Lectures
        </Link>

        <div className="flex items-center gap-2">
          {lecture.youtubeUrl && (
            <button
              onClick={() => setShowVideoPlayer(!showVideoPlayer)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
            >
              <YoutubeIcon className="w-3.5 h-3.5 text-rose-500" />
              <span>{showVideoPlayer ? 'Hide Video' : 'Watch YouTube Video'}</span>
              {showVideoPlayer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-subtle"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied Link
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" /> Share
              </>
            )}
          </button>

          <button
            onClick={() => exportLectureToPdf(lecture)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-subtle transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>

          <button
            onClick={handleDelete}
            title="Delete Lecture"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Embedded YouTube Player */}
      {showVideoPlayer && youtubeId && (
        <div className="rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-elevated aspect-video max-w-3xl mx-auto animate-fade-in">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
            title={lecture.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )}

      {/* Lecture Title Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {lecture.youtubeUrl ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
              <YoutubeIcon className="w-3 h-3 text-rose-500" /> YouTube Lecture
            </span>
          ) : (
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-750">
              {lecture.subject}
            </span>
          )}

          {lecture.youtubeAuthor && (
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              by {lecture.youtubeAuthor}
            </span>
          )}

          <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
            <Clock className="w-3 h-3" />
            {lecture.durationMinutes || 45} mins
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            • {new Date(lecture.createdAt).toLocaleDateString()}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {lecture.title}
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
          {lecture.summary?.tldr}
        </p>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex p-1 bg-slate-100/80 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                isActive
                  ? 'bg-white dark:bg-[#0e1422] text-slate-900 dark:text-white shadow-subtle border border-slate-200/80 dark:border-slate-700/80'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      : 'bg-slate-200/60 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        {activeTab === 'summary' && <SummaryTab lecture={lecture} />}
        {activeTab === 'notes' && <StudyNotesTab notes={lecture.notes} />}
        {activeTab === 'concepts' && (
          <KeyConceptsTab keyConcepts={lecture.keyConcepts} formulas={lecture.formulas} />
        )}
        {activeTab === 'flashcards' && (
          <FlashcardsViewer lecture={lecture} onUpdateLecture={setLecture} />
        )}
        {activeTab === 'quiz' && <PracticeQuiz quiz={lecture.quiz} />}
        {activeTab === 'exam' && (
          <ExamQuestionsTab
            shortAnswer={lecture.examQuestions?.shortAnswer || []}
            longAnswer={lecture.examQuestions?.longAnswer || []}
          />
        )}
        {activeTab === 'transcript' && <TranscriptTab transcript={lecture.transcript} />}
      </div>
    </div>
  );
}
