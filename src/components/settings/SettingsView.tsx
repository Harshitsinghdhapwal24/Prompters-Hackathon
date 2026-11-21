'use client';

import React, { useState, useEffect } from 'react';
import {
  Key,
  Cpu,
  Sliders,
  Sun,
  Moon,
  RotateCcw,
  Check,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import {
  getStoredSettings,
  saveStoredSettings,
  resetToDemoData,
  DEFAULT_SETTINGS,
} from '@/lib/storage';
import { useTheme } from '@/context/ThemeContext';
import { UserSettings } from '@/types/lecture';

export default function SettingsView() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savedBanner, setSavedBanner] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  useEffect(() => {
    const s = getStoredSettings();
    setSettings(s);
    setApiKeyInput(s.geminiApiKey || '');
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveStoredSettings({
      geminiApiKey: apiKeyInput.trim(),
      geminiModel: settings.geminiModel,
      notesDetailLevel: settings.notesDetailLevel,
      targetAudience: settings.targetAudience,
    });
    setSettings(updated);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  const handleResetData = () => {
    if (confirm('Reset lectures database to realistic initial demo data?')) {
      resetToDemoData();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System & AI Engine Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure Google Gemini AI credentials, model architectures, and study preferences.
        </p>
      </div>

      {savedBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-200 text-xs font-semibold animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          Settings saved successfully!
        </div>
      )}

      {resetDone && (
        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center gap-2.5 text-purple-800 dark:text-purple-200 text-xs font-semibold animate-fade-in">
          <Check className="w-4 h-4 text-purple-600" />
          Demo lectures reloaded into local workspace!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Gemini API Key Section */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Key className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Google Gemini API Key
              </h3>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
            >
              Get Free Gemini Key <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your key is stored safely in your browser and used securely across Next.js server-side
            API routes. If blank, LectureLens automatically runs in Demo Mode with realistic
            synthesis!
          </p>

          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-4 py-2.5 text-xs sm:text-sm font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Never exposed to client bundles or external trackers.</span>
          </div>
        </div>

        {/* Gemini Model Architecture */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Engine Model</h3>
              <p className="text-[11px] text-slate-400">Configurable through @google/genai SDK</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', tag: 'Fast & High Multimodal IQ' },
              { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', tag: 'Low Latency Realtime' },
              { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', tag: 'High-Volume Production' },
              { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', tag: 'Deep Reasoning' },
            ].map((m) => (
              <label
                key={m.id}
                className={`p-3.5 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                  settings.geminiModel === m.id
                    ? 'border-purple-500 bg-purple-50/40 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{m.name}</span>
                  <input
                    type="radio"
                    name="geminiModel"
                    value={m.id}
                    checked={settings.geminiModel === m.id}
                    onChange={(e) => setSettings({ ...settings, geminiModel: e.target.value })}
                    className="accent-purple-600"
                  />
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">{m.tag}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Study Note Preferences */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Pedagogical Customization
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Notes Detail Depth
              </label>
              <select
                value={settings.notesDetailLevel}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notesDetailLevel: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-slate-800 dark:text-slate-200"
              >
                <option value="concise">Concise (High-Yield Bullet Points)</option>
                <option value="standard">Standard (Comprehensive College Notes)</option>
                <option value="comprehensive">Comprehensive (Deep Mathematical Derivations)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Exam Strategy
              </label>
              <select
                value={settings.targetAudience}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    targetAudience: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-slate-800 dark:text-slate-200"
              >
                <option value="university">University Midterms & Finals</option>
                <option value="competitive_exam">Competitive Exams (MCAT / GRE / GATE)</option>
                <option value="quick_review">Quick Revision & Flashcard Cramming</option>
              </select>
            </div>
          </div>
        </div>

        {/* Visual Theme */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Interface Theme</h3>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex-1 p-3.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                theme === 'dark'
                  ? 'border-purple-500 bg-purple-950/40 text-purple-200'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600'
              }`}
            >
              <Moon className="w-4 h-4 text-purple-400" /> Dark Mode (Linear / AI SaaS)
            </button>
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex-1 p-3.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                theme === 'light'
                  ? 'border-purple-500 bg-purple-50 text-purple-900'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" /> Light Mode (Notion)
            </button>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleResetData}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reload Demo Lectures
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20 transition-all hover:scale-105"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
