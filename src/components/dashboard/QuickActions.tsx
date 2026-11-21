'use client';

import React from 'react';
import Link from 'next/link';
import { UploadCloud, Layers, HelpCircle, Sparkles, ArrowRight, FileCheck } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    {
      title: 'Upload New Lecture',
      desc: 'Process audio (MP3/WAV), video (MP4), PDF or paste lecture transcripts.',
      href: '/upload',
      icon: UploadCloud,
      cta: 'Start Uploading',
      gradient: 'from-purple-600 via-indigo-600 to-blue-600',
      badge: 'Multimodal AI',
    },
    {
      title: 'Master Flashcard Decks',
      desc: 'Review 3D interactive flashcards with memory spaced repetition.',
      href: '/flashcards',
      icon: Layers,
      cta: 'Review Cards',
      gradient: 'from-indigo-600 to-purple-700',
      badge: 'Active Recall',
    },
    {
      title: 'Exam Practice Quiz',
      desc: 'Challenge yourself with high-yield multiple-choice exam questions.',
      href: '/quiz',
      icon: HelpCircle,
      cta: 'Take Quiz',
      gradient: 'from-blue-600 to-cyan-600',
      badge: 'Instant Feedback',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.map((act, i) => {
        const Icon = act.icon;
        return (
          <Link
            key={i}
            href={act.href}
            className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-800/60 transition-all duration-200 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${act.gradient} flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/50">
                  {act.badge}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {act.title}
              </h3>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {act.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform">
              <span>{act.cta}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
