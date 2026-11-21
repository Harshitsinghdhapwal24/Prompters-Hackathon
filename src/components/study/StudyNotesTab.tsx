'use client';

import React from 'react';
import { FileText, AlertTriangle, Lightbulb, Bookmark } from 'lucide-react';

interface StudyNotesTabProps {
  notes: string;
}

export default function StudyNotesTab({ notes }: StudyNotesTabProps) {
  // Parser to convert markdown notes into styled interactive blocks
  const renderFormattedNotes = (markdownText: string) => {
    const lines = markdownText.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];

    lines.forEach((line, index) => {
      // Code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre
              key={`code-${index}`}
              className="p-4 my-3 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800"
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

      // Horizontal Rule
      if (trimmed === '---' || trimmed === '***') {
        elements.push(
          <hr
            key={`hr-${index}`}
            className="my-6 border-t border-slate-200 dark:border-slate-800"
          />
        );
        return;
      }

      // H1
      if (trimmed.startsWith('# ')) {
        elements.push(
          <h1
            key={`h1-${index}`}
            className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-6 mb-3 tracking-tight"
          >
            {trimmed.replace('# ', '')}
          </h1>
        );
        return;
      }

      // H2
      if (trimmed.startsWith('## ')) {
        elements.push(
          <h2
            key={`h2-${index}`}
            className="text-lg sm:text-xl font-bold text-purple-700 dark:text-purple-300 mt-6 mb-2 border-b border-purple-100 dark:border-purple-950/60 pb-1.5"
          >
            {trimmed.replace('## ', '')}
          </h2>
        );
        return;
      }

      // H3
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3
            key={`h3-${index}`}
            className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mt-4 mb-1.5"
          >
            {trimmed.replace('### ', '')}
          </h3>
        );
        return;
      }

      // Exam Alerts / Callouts (> **Exam Tip:**)
      if (trimmed.startsWith('>')) {
        const quoteContent = trimmed.replace(/^>\s*/, '');
        elements.push(
          <div
            key={`callout-${index}`}
            className="p-4 my-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/10 border-l-4 border-amber-500 flex items-start gap-3 text-amber-900 dark:text-amber-200 text-xs sm:text-sm"
          >
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">
              {formatInlineText(quoteContent)}
            </div>
          </div>
        );
        return;
      }

      // Math equation display ($$...$$)
      if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
        const mathExpr = trimmed.replace(/\$\$/g, '');
        elements.push(
          <div
            key={`math-${index}`}
            className="p-4 my-3 rounded-2xl bg-slate-100 dark:bg-slate-900/90 text-center font-mono text-xs sm:text-sm text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-900/40 overflow-x-auto shadow-inner"
          >
            {mathExpr}
          </div>
        );
        return;
      }

      // Unordered lists
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const bulletText = trimmed.replace(/^[-*]\s+/, '');
        elements.push(
          <li
            key={`li-${index}`}
            className="ml-5 list-disc text-xs sm:text-sm text-slate-700 dark:text-slate-300 my-1 leading-relaxed"
          >
            {formatInlineText(bulletText)}
          </li>
        );
        return;
      }

      // Ordered lists (1. , 2. )
      if (/^\d+\.\s+/.test(trimmed)) {
        elements.push(
          <li
            key={`oli-${index}`}
            className="ml-5 list-decimal text-xs sm:text-sm text-slate-700 dark:text-slate-300 my-1 leading-relaxed"
          >
            {formatInlineText(trimmed.replace(/^\d+\.\s+/, ''))}
          </li>
        );
        return;
      }

      // Normal paragraph
      if (trimmed.length > 0) {
        elements.push(
          <p
            key={`p-${index}`}
            className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 my-2 leading-relaxed"
          >
            {formatInlineText(trimmed)}
          </p>
        );
      }
    });

    return elements;
  };

  const formatInlineText = (text: string) => {
    // Basic bold parser **text**
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
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60 mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Structured Markdown Notes
          </span>
        </div>
      </div>

      <div className="prose-content">
        {renderFormattedNotes(notes || '# No notes generated.')}
      </div>
    </div>
  );
}
