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
  ExternalLink,
  ShieldCheck,
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
    if (confirm('Reset lectures database to initial demo data?')) {
      resetToDemoData();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          System & Model Configuration
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage Google Gemini AI engine credentials, architectures, and study preferences.
        </p>
      </div>

      {savedBanner && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-emerald-800 dark:text-emerald-200 text-xs font-semibold animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          Settings saved successfully.
        </div>
      )}

      {resetDone && (
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-slate-800 dark:text-slate-200 text-xs font-semibold animate-fade-in">
          <Check className="w-4 h-4 text-indigo-500" />
          Demo lectures reloaded into local workspace.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Gemini API Key */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <Key className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Google Gemini API Key
              </h3>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              Get API Key <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Stored locally in your browser. Leave empty to use Demonstration Mode with intelligent auto-synthesis.
          </p>

          <label htmlFor="gemini-api-key-input" className="sr-only">
            Google Gemini API Key
          </label>
          <input
            id="gemini-api-key-input"
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="AIzaSy..."
            aria-label="Google Gemini API Key"
            className="w-full px-3.5 py-2 text-xs sm:text-sm font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Never exposed in frontend bundles or logs.</span>
          </div>
        </div>

        {/* Gemini Model Architecture */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Gemini Model Architecture
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', tag: 'High-speed multimodal' },
              { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', tag: 'Ultra-low latency' },
              { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', tag: 'Production scale' },
              { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', tag: 'Deep logical synthesis' },
            ].map((m) => (
              <label
                key={m.id}
                className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                  settings.geminiModel === m.id
                    ? 'border-indigo-500 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">{m.name}</span>
                  <input
                    type="radio"
                    name="geminiModel"
                    value={m.id}
                    checked={settings.geminiModel === m.id}
                    onChange={(e) => setSettings({ ...settings, geminiModel: e.target.value })}
                    className="accent-indigo-600"
                  />
                </div>
                <span className="text-[10px] text-slate-400">{m.tag}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Study Strategy Customization */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Pedagogical Depth & Strategy
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
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
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
              >
                <option value="concise">Concise (High-Yield Bullets)</option>
                <option value="standard">Standard (College Study Notes)</option>
                <option value="comprehensive">Comprehensive (Full Derivations)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Target Examination Focus
              </label>
              <select
                value={settings.targetAudience}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    targetAudience: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
              >
                <option value="university">University Midterms & Finals</option>
                <option value="competitive_exam">Competitive (MCAT / GRE / GATE)</option>
                <option value="quick_review">Rapid Revision Cramming</option>
              </select>
            </div>
          </div>
        </div>

        {/* Visual Theme Selection */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200/80 dark:border-slate-800/80 shadow-subtle space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Interface Theme
          </h3>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-medium transition-all ${
                theme === 'dark'
                  ? 'border-indigo-500 bg-slate-800 text-white'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" /> Obsidian Dark (Linear Style)
            </button>
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-medium transition-all ${
                theme === 'light'
                  ? 'border-indigo-500 bg-slate-100 text-slate-900 font-semibold'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" /> Studio Light (Notion Style)
            </button>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleResetData}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reload Demo Data
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2 rounded-xl font-semibold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-subtle transition-all"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
