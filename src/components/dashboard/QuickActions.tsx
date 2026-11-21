'use client';

import React from 'react';
import Link from 'next/link';
import { UploadCloud, Layers, HelpCircle, ArrowRight } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    {
      title: 'Upload Lecture',
      desc: 'Process audio (MP3/WAV), video (MP4), PDF or paste transcripts directly.',
      href: '/upload',
      icon: UploadCloud,
      cta: 'Start Uploading',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/60',
      badge: 'Multimodal',
    },
    {
      title: 'Review Flashcards',
      desc: 'Train memory with 3D interactive flashcards and active recall tracking.',
      href: '/flashcards',
      icon: Layers,
      cta: 'Review Deck',
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-50 dark:bg-blue-950/60',
      badge: 'Active Recall',
    },
    {
      title: 'Practice Exam Quiz',
      desc: 'Challenge yourself with high-yield multiple-choice questions & explanations.',
      href: '/quiz',
      icon: HelpCircle,
      cta: 'Take Quiz',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
      badge: 'Instant Scoring',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
      {actions.map((act, i) => {
        const Icon = act.icon;
        return (
          <Link
            key={i}
            href={act.href}
            className="p-5 rounded-xl bg-white dark:bg-[#0e1422] border border-slate-200/80 dark:border-slate-800/80 shadow-subtle hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-150 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${act.iconBg} ${act.iconColor} flex items-center justify-center transition-transform group-hover:scale-105`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                  {act.badge}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {act.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {act.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <span>{act.cta}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
