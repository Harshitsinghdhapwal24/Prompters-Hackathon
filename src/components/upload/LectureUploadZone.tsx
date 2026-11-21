'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  FileAudio,
  FileVideo,
  FileText,
  FileCode,
  Sparkles,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileUp,
  Cpu,
} from 'lucide-react';
import { getStoredSettings, saveLecture } from '@/lib/storage';
import { SourceType } from '@/types/lecture';

export default function LectureUploadZone() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lectureTitle, setLectureTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [transcriptText, setTranscriptText] = useState('');

  // Generation status
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const steps = [
    'Validating input lecture source...',
    'Analyzing audio / video transcript semantics with Gemini AI...',
    'Extracting high-yield concepts, definitions & equations...',
    'Synthesizing 3D flashcards & exam practice quiz questions...',
    'Finalizing comprehensive study package & notes...',
  ];

  const allowedExtensions = ['mp3', 'wav', 'm4a', 'mp4', 'webm', 'pdf', 'txt', 'md'];

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    setErrorMessage('');
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!allowedExtensions.includes(ext)) {
      setErrorMessage(
        `Unsupported file type .${ext}. Please upload MP3, WAV, M4A, MP4, WebM, PDF, or TXT.`
      );
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage('File size exceeds 50MB limit. Please upload a smaller file or use transcript text.');
      return;
    }

    setSelectedFile(file);
    if (!lectureTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setLectureTitle(cleanName);
    }
  };

  const inferSourceType = (file: File | null): SourceType => {
    if (!file) return 'text';
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (['mp3', 'wav', 'm4a'].includes(ext) || file.type.startsWith('audio/')) return 'audio';
    if (['mp4', 'webm'].includes(ext) || file.type.startsWith('video/')) return 'video';
    if (ext === 'pdf' || file.type === 'application/pdf') return 'pdf';
    return 'text';
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (activeTab === 'upload' && !selectedFile) {
      setErrorMessage('Please select an audio, video, or document file to proceed.');
      return;
    }

    if (activeTab === 'text' && !transcriptText.trim()) {
      setErrorMessage('Please paste or write a lecture transcript/notes.');
      return;
    }

    setIsProcessing(true);
    setCurrentStep(0);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2800);

    try {
      const settings = getStoredSettings();
      const apiKey = settings.geminiApiKey || '';
      const model = settings.geminiModel || 'gemini-2.5-flash';

      let response: Response;

      if (activeTab === 'upload' && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', lectureTitle || selectedFile.name);
        formData.append('subject', subject || 'General Studies');
        formData.append('sourceType', inferSourceType(selectedFile));

        response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'x-gemini-api-key': apiKey,
            'x-gemini-model': model,
          },
          body: formData,
        });
      } else {
        response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-gemini-api-key': apiKey,
            'x-gemini-model': model,
          },
          body: JSON.stringify({
            title: lectureTitle || 'Lecture Notes',
            subject: subject || 'General Studies',
            text: transcriptText,
            sourceType: 'text',
          }),
        });
      }

      clearInterval(stepInterval);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate study materials.');
      }

      // Save generated lecture to localStorage
      saveLecture(data.lecture);

      // Redirect directly to the generated study material viewer!
      router.push(`/lectures/${data.lecture.id}`);
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsProcessing(false);
      setErrorMessage(err.message || 'An unexpected error occurred while processing.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Tab Switcher */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'upload'
              ? 'bg-white dark:bg-[#111827] text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          Upload Audio / Video / PDF
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'text'
              ? 'bg-white dark:bg-[#111827] text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Paste Lecture Transcript
        </button>
      </div>

      {/* Form Container */}
      <form onSubmit={handleGenerate} className="space-y-6">
        {/* Lecture Meta Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Lecture Title <span className="text-slate-400">(optional)</span>
            </label>
            <input
              type="text"
              value={lectureTitle}
              onChange={(e) => setLectureTitle(e.target.value)}
              placeholder="e.g., CS 182: Transformers & Attention Mechanisms"
              disabled={isProcessing}
              className="w-full px-4 py-2.5 text-sm bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Course / Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Computer Science, Biochemistry, Economics"
              disabled={isProcessing}
              className="w-full px-4 py-2.5 text-sm bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Tab 1: Upload Zone */}
        {activeTab === 'upload' && (
          <div>
            {!selectedFile ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
                  dragOver
                    ? 'border-purple-500 bg-purple-500/5 scale-[1.01]'
                    : 'border-slate-300 dark:border-slate-800 hover:border-purple-400/80 bg-white dark:bg-[#111827]/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp3,.wav,.m4a,.mp4,.webm,.pdf,.txt,.md"
                  onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
                  className="hidden"
                />

                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-purple-500/25">
                  <UploadCloud className="w-8 h-8 animate-bounce" />
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Drag & Drop your lecture file here
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Supports Audio (MP3, WAV, M4A), Video (MP4, WebM), and Lecture Documents (PDF, TXT)
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40">
                    <FileAudio className="w-3.5 h-3.5" /> Audio
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
                    <FileVideo className="w-3.5 h-3.5" /> Video
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200/60 dark:border-red-800/40">
                    <FileText className="w-3.5 h-3.5" /> PDF
                  </span>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    Or Browse Local Files
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <FileUp className="w-6 h-6" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatFileSize(selectedFile.size)} • Ready for processing
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  disabled={isProcessing}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Remove file"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Text / Transcript Input */}
        {activeTab === 'text' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Paste Lecture Transcript or Raw Notes
            </label>
            <textarea
              rows={9}
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              disabled={isProcessing}
              placeholder="Paste lecture transcript, YouTube speech-to-text, professor audio notes, or textbook chapter excerpts here..."
              className="w-full p-4 text-sm bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 leading-relaxed"
            />
            <div className="mt-2 flex justify-between text-xs text-slate-400">
              <span>{transcriptText.length} characters</span>
              <button
                type="button"
                onClick={() => {
                  setLectureTitle('MIT 6.006: Introduction to Algorithms — Dynamic Programming');
                  setSubject('Computer Science');
                  setTranscriptText(
                    `Welcome everyone. Today we begin our module on Dynamic Programming (DP). Remember: DP is essentially recursion with memoization and subproblem identification. When can we apply DP? Two conditions must hold: 1) Optimal Substructure, meaning an optimal solution to the problem contains optimal solutions to subproblems, and 2) Overlapping Subproblems, meaning the space of subproblems must be small, so a recursive algorithm visits the same subproblems repeatedly rather than generating new ones. Take the Fibonacci sequence: computing fib(5) recursively without caching has exponential complexity O(2^n). But if you memoize results in a lookup table or bottom-up array, time complexity collapses to linear O(n). Always analyze space-time trade-offs on exams!`
                  );
                }}
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                Insert Sample MIT Lecture
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-red-700 dark:text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Processing Animation & Progress Bar */}
        {isProcessing && (
          <div className="p-6 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-spin" />
                <span className="text-sm font-semibold text-purple-900 dark:text-purple-200">
                  Processing Lecture with Gemini AI
                </span>
              </div>
              <span className="text-xs font-mono text-purple-600 dark:text-purple-400">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-purple-200/60 dark:bg-purple-900/40 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-700 ease-out"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>

            <p className="text-xs text-purple-700 dark:text-purple-300 font-medium animate-pulse">
              {steps[currentStep]}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full py-3.5 px-6 rounded-2xl font-semibold text-sm bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-600/25 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Study Materials...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Generate Complete Study Guide & Notes
            </>
          )}
        </button>
      </form>
    </div>
  );
}
