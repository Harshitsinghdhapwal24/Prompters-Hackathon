'use client';

import React from 'react';
import { FileText, AlertTriangle } from 'lucide-react';

interface StudyNotesTabProps {
  notes: string;
}

export default function StudyNotesTab({ notes }: StudyNotesTabProps) {
  const renderFormattedNotes = (markdownText: string) => {
    const lines = markdownText.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];

    lines.forEach((line, index) => {
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre
              key={`code-${index}`}
              className="p-3.5 my-2.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800"
            >
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      const trimmed = line.trim();

      if (trimmed === '---' || trimmed === '***') {
        elements.push(
          <hr
            key={`hr-${index}`}
            className="my-5 border-t border-slate-200 dark:border-slate-800"
          />
        );
        return;
      }

      if (trimmed.startsWith('# ')) {
        elements.push(
          <h1
            key={`h1-${index}`}
            className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-5 mb-2.5 tracking-tight"
          >
            {trimmed.replace('# ', '')}
          </h1>
        );
        return;
      }

      if (trimmed.startsWith('## ')) {
        elements.push(
          <h2
            key={`h2-${index}`}
            className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-5 mb-2 border-b border-slate-200 dark:border-slate-800/80 pb-1"
          >
            {trimmed.replace('## ', '')}
          </h2>
        );
        return;
      }

      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3
            key={`h3-${index}`}
            className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-3.5 mb-1"
          >
            {trimmed.replace('### ', '')}
          </h3>
        );
        return;
      }

      if (trimmed.startsWith('>')) {
        const quoteContent = trimmed.replace(/^>\s*/, '');
        elements.push(
          <div
            key={`callout-${index}`}
            className="p-3.5 my-3 rounded-xl bg-amber-500/10 dark:bg-amber-500/10 border-l-3 border-amber-500 flex items-start gap-2.5 text-amber-900 dark:text-amber-200 text-xs"
          >
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">
              {formatInlineText(quoteContent)}
            </div>
          </div>
        );
        return;
      }

      if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
        const mathExpr = trimmed.replace(/\$\$/g, '');
        elements.push(
          <div
            key={`math-${index}`}
            className="p-3 my-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-center font-mono text-xs sm:text-sm text-indigo-600 dark:text-indigo-300 border border-slate-200 dark:border-slate-800 overflow-x-auto"
          >
            {mathExpr}
          </div>
        );
        return;
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const bulletText = trimmed.replace(/^[-*]\s+/, '');
        elements.push(
          <li
            key={`li-${index}`}
            className="ml-5 list-disc text-xs sm:text-sm text-slate-700 dark:text-slate-300 my-0.5 leading-relaxed"
          >
            {formatInlineText(bulletText)}
          </li>
        );
        return;
      }

      if (/^\d+\.\s+/.test(trimmed)) {
        elements.push(
          <li
            key={`oli-${index}`}
            className="ml-5 list-decimal text-xs sm:text-sm text-slate-700 dark:text-slate-300 my-0.5 leading-relaxed"
          >
            {formatInlineText(trimmed.replace(/^\d+\.\s+/, ''))}
          </li>
        );
        return;
      }

      if (trimmed.length > 0) {
        elements.push(
          <p
            key={`p-${index}`}
            className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 my-1.5 leading-relaxed"
          >
            {formatInlineText(trimmed)}
          </p>
        );
      }
    });

    return elements;
  };

  const formatInlineText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-2">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Study Notes
          </span>
        </div>
      </div>

      <div className="prose-content">
        {renderFormattedNotes(notes || '# No notes generated.')}
      </div>
    </div>
  );
}
