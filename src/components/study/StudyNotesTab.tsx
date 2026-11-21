'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Info,
  Copy,
  Check,
  Clock,
  BookOpen,
  List,
  Search,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface StudyNotesTabProps {
  notes: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function StudyNotesTab({ notes }: StudyNotesTabProps) {
  const [copied, setCopied] = useState(false);
  const [showToc, setShowToc] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('');
  const [focusMode, setFocusMode] = useState(false);

  // Compute reading statistics
  const stats = useMemo(() => {
    const words = notes ? notes.trim().split(/\s+/).length : 0;
    const readingTime = Math.max(1, Math.ceil(words / 180));
    const headingCount = (notes.match(/^#{1,3}\s/gm) || []).length;
    return { words, readingTime, headingCount };
  }, [notes]);

  // Extract Table of Contents
  const tocItems = useMemo<TocItem[]>(() => {
    if (!notes) return [];
    const lines = notes.split('\n');
    const items: TocItem[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      let level = 0;
      let text = '';

      if (trimmed.startsWith('### ')) {
        level = 3;
        text = trimmed.replace('### ', '');
      } else if (trimmed.startsWith('## ')) {
        level = 2;
        text = trimmed.replace('## ', '');
      } else if (trimmed.startsWith('# ')) {
        level = 1;
        text = trimmed.replace('# ', '');
      }

      if (level > 0 && text) {
        // Strip markdown formatting from text for ID
        const cleanText = text.replace(/[*_`]/g, '').trim();
        const id = cleanText
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        items.push({ id, text: cleanText, level });
      }
    });

    return items;
  }, [notes]);

  const handleCopyNotes = () => {
    if (!notes) return;
    navigator.clipboard.writeText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToHeading = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Render markdown text into rich interactive components
  const renderFormattedNotes = (markdownText: string) => {
    const lines = markdownText.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let tableBuffer: string[] = [];
    let inTable = false;

    const flushTable = (keyPrefix: string) => {
      if (tableBuffer.length === 0) return;
      const parsedRows = tableBuffer
        .filter((row) => !row.trim().match(/^\|?[\s-:]+\|?$/)) // filter separator row
        .map((row) =>
          row
            .split('|')
            .map((c) => c.trim())
            .filter((c, idx, arr) => !(idx === 0 && c === '') && !(idx === arr.length - 1 && c === ''))
        );

      if (parsedRows.length > 0) {
        const headerRow = parsedRows[0];
        const bodyRows = parsedRows.slice(1);

        elements.push(
          <div key={`table-wrapper-${keyPrefix}`} className="my-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                  {headerRow.map((col, idx) => (
                    <th key={`th-${idx}`} className="py-2.5 px-3.5 font-semibold text-slate-800 dark:text-slate-200">
                      {formatInlineText(col)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {bodyRows.map((row, rIdx) => (
                  <tr
                    key={`tr-${rIdx}`}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {row.map((cell, cIdx) => (
                      <td key={`td-${cIdx}`} className="py-2.5 px-3.5 text-slate-700 dark:text-slate-300">
                        {formatInlineText(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      tableBuffer = [];
      inTable = false;
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Check if line is part of a markdown table
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        inTable = true;
        tableBuffer.push(trimmed);
        return;
      } else if (inTable) {
        flushTable(`flush-${index}`);
      }

      // Code blocks
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre
              key={`code-${index}`}
              className="p-4 my-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner"
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

      // Dividers
      if (trimmed === '---' || trimmed === '***') {
        elements.push(
          <hr
            key={`hr-${index}`}
            className="my-6 border-t border-slate-200 dark:border-slate-800"
          />
        );
        return;
      }

      // Headings
      if (trimmed.startsWith('# ')) {
        const text = trimmed.replace('# ', '');
        const id = text.replace(/[*_`]/g, '').toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        elements.push(
          <h1
            id={id}
            key={`h1-${index}`}
            className="scroll-mt-20 text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-8 mb-3 tracking-tight border-b border-slate-200 dark:border-slate-800 pb-2"
          >
            {text}
          </h1>
        );
        return;
      }

      if (trimmed.startsWith('## ')) {
        const text = trimmed.replace('## ', '');
        const id = text.replace(/[*_`]/g, '').toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        elements.push(
          <h2
            id={id}
            key={`h2-${index}`}
            className="scroll-mt-20 text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-6 mb-2.5 flex items-center gap-2 group"
          >
            <span className="w-1.5 h-4 bg-indigo-600 dark:bg-indigo-400 rounded-full inline-block group-hover:scale-y-125 transition-transform" />
            <span>{text}</span>
          </h2>
        );
        return;
      }

      if (trimmed.startsWith('### ')) {
        const text = trimmed.replace('### ', '');
        const id = text.replace(/[*_`]/g, '').toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        elements.push(
          <h3
            id={id}
            key={`h3-${index}`}
            className="scroll-mt-20 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-4 mb-1.5 text-indigo-700 dark:text-indigo-400"
          >
            {text}
          </h3>
        );
        return;
      }

      // Callouts & Quotes
      if (trimmed.startsWith('>')) {
        const quoteContent = trimmed.replace(/^>\s*/, '');
        const isExamAlert = /exam (alert|tip|trap|pitfall)/i.test(quoteContent);
        const isCaution = /caution|warning|important/i.test(quoteContent);
        const isKeyTakeaway = /key takeaway|formula|theorem/i.test(quoteContent);

        let borderClass = 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200';
        let IconComponent = Info;

        if (isExamAlert) {
          borderClass = 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200';
          IconComponent = AlertTriangle;
        } else if (isCaution) {
          borderClass = 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200';
          IconComponent = AlertOctagon;
        } else if (isKeyTakeaway) {
          borderClass = 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200';
          IconComponent = CheckCircle2;
        }

        elements.push(
          <div
            key={`callout-${index}`}
            className={`p-3.5 my-3.5 rounded-xl border-l-4 flex items-start gap-3 text-xs leading-relaxed ${borderClass}`}
          >
            <IconComponent className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="font-medium flex-1">
              {formatInlineText(quoteContent)}
            </div>
          </div>
        );
        return;
      }

      // Display math $$ ... $$
      if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
        const mathExpr = trimmed.replace(/\$\$/g, '');
        elements.push(
          <div
            key={`math-${index}`}
            className="p-3.5 my-3 rounded-xl bg-slate-900 text-center font-mono text-xs sm:text-sm text-indigo-300 border border-slate-800 shadow-sm overflow-x-auto"
          >
            {mathExpr}
          </div>
        );
        return;
      }

      // Bullet lists
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

      // Numbered lists
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

      // Standard paragraphs
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

    if (inTable) {
      flushTable('flush-final');
    }

    return elements;
  };

  // Helper for inline markdown: bold, code, inline math
  const formatInlineText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\$.*?\$)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-[11px]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('$') && part.endsWith('$')) {
        return (
          <span
            key={i}
            className="px-1 font-mono text-[11px] text-indigo-600 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/30 rounded"
          >
            {part.slice(1, -1)}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className={`space-y-4 ${focusMode ? 'fixed inset-0 z-50 bg-white dark:bg-[#090d16] p-6 overflow-y-auto' : ''}`}>
      {/* Top Controls Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200/80 dark:border-slate-800/80 shadow-subtle">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Comprehensive Study Notes</span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {stats.readingTime} min read
            </span>
            <span>•</span>
            <span>{stats.words.toLocaleString()} words</span>
            <span>•</span>
            <span>{stats.headingCount} key sections</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {tocItems.length > 0 && (
            <button
              onClick={() => setShowToc(!showToc)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                showToc
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Toggle Table of Contents"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Index</span>
            </button>
          )}

          <button
            onClick={handleCopyNotes}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            title="Copy all notes as Markdown"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Markdown</span>
              </>
            )}
          </button>

          <button
            onClick={() => setFocusMode(!focusMode)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            title={focusMode ? 'Exit Full Screen' : 'Focus Mode'}
          >
            {focusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Layout: Notes with Sticky Table of Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Table of Contents Column */}
        {showToc && tocItems.length > 0 && (
          <div className="lg:col-span-1 lg:sticky lg:top-20 order-2 lg:order-1 space-y-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200/80 dark:border-slate-800/80 shadow-subtle">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800/80 mb-2.5">
                <List className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Quick Navigation
                </span>
              </div>

              <nav className="space-y-1 max-h-[70vh] overflow-y-auto pr-1 text-xs">
                {tocItems.map((item, idx) => (
                  <button
                    key={`toc-${idx}`}
                    onClick={() => scrollToHeading(item.id)}
                    className={`w-full text-left py-1 px-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                      item.level === 1
                        ? 'font-bold text-slate-900 dark:text-slate-100'
                        : item.level === 2
                        ? 'pl-3.5 font-medium text-slate-700 dark:text-slate-300'
                        : 'pl-6 text-slate-500 dark:text-slate-400 text-[11px]'
                    } ${
                      activeSection === item.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <ChevronRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{item.text}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Study Notes Content Area */}
        <div className={`${showToc && tocItems.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'} order-1 lg:order-2`}>
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-2">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Lecture Study Material
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Exam-oriented syllabus notes
              </span>
            </div>

            <div className="prose-content">
              {renderFormattedNotes(notes || '# No notes generated.')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
