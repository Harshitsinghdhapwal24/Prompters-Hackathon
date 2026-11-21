'use client';

import React, { useState } from 'react';
import { Search, Copy, Check, Clock, User } from 'lucide-react';
import { TranscriptItem } from '@/types/lecture';

interface TranscriptTabProps {
  transcript: TranscriptItem[] | string;
}

export default function TranscriptTab({ transcript }: TranscriptTabProps) {
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  const items: TranscriptItem[] = Array.isArray(transcript)
    ? transcript
    : [{ time: '00:00:00', text: transcript || 'No transcript text available.' }];

  const filteredItems = items.filter((item) => {
    return (
      item.text.toLowerCase().includes(search.toLowerCase()) ||
      (item.speaker && item.speaker.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const handleCopy = () => {
    const fullText = items
      .map((i) => `[${i.time}] ${i.speaker ? `${i.speaker}: ` : ''}${i.text}`)
      .join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/60">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search words in transcript..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-500" /> Copied to Clipboard
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" /> Copy Full Transcript
            </>
          )}
        </button>
      </div>

      {/* Transcript Items */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No matching words in transcript.
          </div>
        ) : (
          filteredItems.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60 flex items-start gap-4 text-xs sm:text-sm leading-relaxed"
            >
              <div className="flex items-center gap-1.5 font-mono text-purple-600 dark:text-purple-400 font-semibold text-xs flex-shrink-0 mt-0.5">
                <Clock className="w-3.5 h-3.5" />
                {item.time}
              </div>

              <div className="space-y-1 flex-1">
                {item.speaker && (
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                    <User className="w-3 h-3 text-slate-400" />
                    {item.speaker}
                  </div>
                )}
                <p className="text-slate-700 dark:text-slate-200">{item.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
