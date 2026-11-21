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
  BookOpen,
  FileText,
  Tag,
  Layers,
  HelpCircle,
  Award,
  FileCode,
} from 'lucide-react';
import { Lecture } from '@/types/lecture';
import { exportLectureToPdf } from '@/lib/pdfGenerator';
import { deleteLecture } from '@/lib/storage';

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

  const tabs = [
    { id: 'summary', name: 'Executive Summary', icon: Sparkles },
    { id: 'notes', name: 'Study Notes', icon: FileText },
    { id: 'concepts', name: 'Concepts & Formulas', icon: Tag, count: (lecture.keyConcepts?.length || 0) + (lecture.formulas?.length || 0) },
    { id: 'flashcards', name: 'Flashcards', icon: Layers, count: lecture.flashcards?.length || 0 },
    { id: 'quiz', name: 'Practice Quiz', icon: HelpCircle, count: lecture.quiz?.length || 0 },
    { id: 'exam', name: 'Exam Questions', icon: Award, count: (lecture.examQuestions?.shortAnswer?.length || 0) + (lecture.examQuestions?.longAnswer?.length || 0) },
    { id: 'transcript', name: 'Full Transcript', icon: FileCode },
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
      {/* Back link & Top Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/lectures"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Lectures
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
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
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-sm shadow-purple-600/20 transition-all hover:scale-105"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>

          <button
            onClick={handleDelete}
            title="Delete Lecture"
            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lecture Title Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/50">
            {lecture.subject}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
            <Clock className="w-3 h-3" />
            {lecture.durationMinutes || 45} mins
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            • {new Date(lecture.createdAt).toLocaleDateString()}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
          {lecture.title}
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
          {lecture.summary?.tldr}
        </p>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex p-1.5 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-x-auto shadow-sm gap-1 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
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
      <div className="mt-6">
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
