'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, ArrowLeft, Loader2 } from 'lucide-react';
import { getStoredLectures } from '@/lib/storage';
import { DEMO_LECTURES } from '@/data/demoLectures';
import { Lecture } from '@/types/lecture';
import StudyMaterialViewer from '@/components/study/StudyMaterialViewer';

export default function LectureDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const lectureId = params?.id as string;
  const initialTab = searchParams?.get('tab') || 'summary';

  const [lecture, setLecture] = useState<Lecture | null>(() => {
    return DEMO_LECTURES.find((l) => l.id === lectureId) || null;
  });
  const [loading, setLoading] = useState(!DEMO_LECTURES.some((l) => l.id === lectureId));

  useEffect(() => {
    if (lectureId) {
      const all = getStoredLectures();
      const found = all.find((l) => l.id === lectureId);
      if (found) {
        setLecture(found);
      }
      setLoading(false);
    }
  }, [lectureId]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="text-xs">Loading lecture materials...</span>
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          Lecture Not Found
        </h2>
        <p className="text-xs text-slate-500">
          The requested study material may have been deleted or the link is invalid.
        </p>
        <Link
          href="/lectures"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Lectures
        </Link>
      </div>
    );
  }

  return <StudyMaterialViewer initialLecture={lecture} defaultTab={initialTab} />;
}
