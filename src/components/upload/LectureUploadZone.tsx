'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  FileAudio,
  FileVideo,
  FileText,
  X,
  AlertCircle,
  Loader2,
  FileUp,
  CheckCircle2,
  Play,
} from 'lucide-react';
import { YoutubeIcon } from '@/components/icons/YoutubeIcon';
import { getStoredSettings, saveLecture } from '@/lib/storage';
import { SourceType } from '@/types/lecture';

export default function LectureUploadZone() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'youtube' | 'upload' | 'text'>('youtube');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lectureTitle, setLectureTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [transcriptText, setTranscriptText] = useState('');

  // YouTube state
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [youtubePreview, setYoutubePreview] = useState<{
    videoId: string;
    url: string;
    title: string;
    author: string;
    thumbnailUrl: string;
    hasTranscript: boolean;
    transcriptCount: number;
    excerpt?: string;
  } | null>(null);

  // Generation status
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const steps = [
    activeTab === 'youtube'
      ? 'Fetching YouTube metadata & timed captions...'
      : 'Validating lecture source...',
    'Analyzing lecture transcript semantics with Gemini AI...',
    'Extracting high-yield concepts, definitions & equations...',
    'Synthesizing 3D flashcards & exam practice quiz questions...',
    'Finalizing comprehensive study package & notes...',
  ];

  const allowedExtensions = ['mp3', 'wav', 'm4a', 'mp4', 'webm', 'pdf', 'txt', 'md'];

  const handleFetchYouTubePreview = async (urlToFetch: string) => {
    if (!urlToFetch || urlToFetch.length < 10) return;
    setLoadingPreview(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/youtube-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToFetch }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setYoutubePreview(data.data);
        if (!lectureTitle) {
          setLectureTitle(data.data.title);
        }
      } else {
        setYoutubePreview(null);
        setErrorMessage(data.error || 'Could not fetch video preview from YouTube.');
      }
    } catch (err: any) {
      console.warn('Preview error:', err);
      setYoutubePreview(null);
    } finally {
      setLoadingPreview(false);
    }
  };

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

    if (activeTab === 'youtube' && !youtubeUrl.trim()) {
      setErrorMessage('Please enter a YouTube video URL.');
      return;
    }

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

      if (activeTab === 'youtube') {
        response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-gemini-api-key': apiKey,
            'x-gemini-model': model,
          },
          body: JSON.stringify({
            youtubeUrl: youtubeUrl.trim(),
            title: lectureTitle || youtubePreview?.title || '',
            subject: subject || 'General Studies',
            sourceType: 'youtube',
          }),
        });
      } else if (activeTab === 'upload' && selectedFile) {
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

      saveLecture(data.lecture);
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
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Tab Switcher */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('youtube')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'youtube'
              ? 'bg-white dark:bg-[#0e1422] text-slate-900 dark:text-white shadow-subtle border border-slate-200/60 dark:border-slate-700/60'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
          }`}
        >
          <YoutubeIcon className="w-3.5 h-3.5 text-rose-500" />
          YouTube Video
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'upload'
              ? 'bg-white dark:bg-[#0e1422] text-slate-900 dark:text-white shadow-subtle border border-slate-200/60 dark:border-slate-700/60'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          Audio / Video File
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'text'
              ? 'bg-white dark:bg-[#0e1422] text-slate-900 dark:text-white shadow-subtle border border-slate-200/60 dark:border-slate-700/60'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Paste Transcript
        </button>
      </div>

      {/* Form Container */}
      <form onSubmit={handleGenerate} className="space-y-4">
        {/* Meta inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Lecture Title <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={lectureTitle}
              onChange={(e) => setLectureTitle(e.target.value)}
              placeholder="e.g., CS 182: Transformers & Attention"
              disabled={isProcessing}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Course / Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Computer Science, Biochemistry"
              disabled={isProcessing}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Tab 1: YouTube Video Link */}
        {activeTab === 'youtube' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                YouTube Video Link
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <YoutubeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => {
                      setYoutubeUrl(e.target.value);
                      if (e.target.value.includes('youtu')) {
                        handleFetchYouTubePreview(e.target.value);
                      }
                    }}
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    disabled={isProcessing}
                    className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleFetchYouTubePreview(youtubeUrl)}
                  disabled={loadingPreview || !youtubeUrl}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50"
                >
                  {loadingPreview ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Fetch Info'}
                </button>
              </div>
            </div>

            {/* Quick Demo YouTube Videos */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
              <span>Try sample:</span>
              <button
                type="button"
                onClick={() => {
                  const url = 'https://www.youtube.com/watch?v=aircAruvnKk';
                  setYoutubeUrl(url);
                  setSubject('Computer Science');
                  handleFetchYouTubePreview(url);
                }}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                3Blue1Brown Neural Networks
              </button>
              <button
                type="button"
                onClick={() => {
                  const url = 'https://www.youtube.com/watch?v=OQ5jsbhAv_M';
                  setYoutubeUrl(url);
                  setSubject('Algorithms & Math');
                  handleFetchYouTubePreview(url);
                }}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                MIT Dynamic Programming
              </button>
            </div>

            {/* YouTube Live Preview Card */}
            {youtubePreview && (
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col sm:flex-row gap-3 items-start sm:items-center animate-fade-in">
                <div className="relative w-full sm:w-36 h-24 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0 border border-slate-800">
                  <img
                    src={youtubePreview.thumbnailUrl}
                    alt={youtubePreview.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md">
                      <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
                      YouTube Lecture
                    </span>
                    <span className="text-[11px] text-slate-400 truncate">
                      {youtubePreview.author}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">
                    {youtubePreview.title}
                  </h4>

                  <div className="flex items-center gap-2 pt-0.5 text-[11px]">
                    {youtubePreview.hasTranscript ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        Captions Available ({youtubePreview.transcriptCount} lines)
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        Auto-caption generation will be applied
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Upload File */}
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
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-150 ${
                  dragOver
                    ? 'border-indigo-500 bg-indigo-500/5'
                    : 'border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white dark:bg-[#0e1422]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp3,.wav,.m4a,.mp4,.webm,.pdf,.txt,.md"
                  onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 mx-auto mb-3 shadow-subtle">
                  <UploadCloud className="w-6 h-6 text-indigo-500" />
                </div>

                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                  Drag and drop lecture file here
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Supports Audio (MP3, WAV, M4A), Video (MP4, WebM), and PDF lecture slides
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <FileAudio className="w-3 h-3 text-indigo-500" /> MP3 / WAV
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <FileVideo className="w-3 h-3 text-blue-500" /> MP4 / WebM
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <FileText className="w-3 h-3 text-rose-500" /> PDF / TXT
                  </span>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    Select File
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 shadow-subtle flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-500">
                    <FileUp className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatFileSize(selectedFile.size)} • Ready for processing
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  disabled={isProcessing}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Transcript Input */}
        {activeTab === 'text' && (
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Lecture Transcript or Raw Notes
            </label>
            <textarea
              rows={8}
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              disabled={isProcessing}
              placeholder="Paste classroom transcript, speech-to-text, or textbook notes here..."
              className="w-full p-3.5 text-xs sm:text-sm bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 leading-relaxed font-mono"
            />
            <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
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
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Insert Sample MIT Lecture
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Progress Tracker */}
        {isProcessing && (
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  {activeTab === 'youtube' ? 'Processing YouTube Video' : 'Gemini Multimodal Processing'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>

            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-700 ease-out"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>

            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              {steps[currentStep]}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-subtle transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Study Materials...
            </>
          ) : activeTab === 'youtube' ? (
            <>
              <YoutubeIcon className="w-4 h-4 text-white" />
              Process YouTube Video & Generate Notes
            </>
          ) : (
            'Generate Study Materials'
          )}
        </button>
      </form>
    </div>
  );
}
