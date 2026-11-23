'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  Layers,
  HelpCircle,
  Settings,
  Sparkles,
  Sun,
  Moon,
  Menu,
  X,
  Compass,
  Cpu,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { getStoredLectures, getStoredSettings } from '@/lib/storage';

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lectureCount, setLectureCount] = useState(0);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [engineStatus, setEngineStatus] = useState('Gemini 2.5 Flash');
  const [keyType, setKeyType] = useState('Demo mode');

  useEffect(() => {
    const updateStats = () => {
      const lecs = getStoredLectures();
      setLectureCount(lecs.length);
      const settings = getStoredSettings();
      const hasGemini = Boolean(settings.geminiApiKey);
      const hasGroq = Boolean(settings.groqApiKey);
      setHasApiKey(hasGemini || hasGroq);

      if (hasGemini && hasGroq) {
        setEngineStatus('Gemini + Groq Failover');
        setKeyType('Dual AI Engines Active');
      } else if (hasGemini) {
        setEngineStatus('Gemini 2.5 Flash');
        setKeyType('Custom Gemini Key');
      } else if (hasGroq) {
        setEngineStatus('Groq LLaMA 3.3');
        setKeyType('Groq Engine Active');
      } else {
        setEngineStatus('Gemini 2.5 Flash');
        setKeyType('Engine ready • Demo mode');
      }
    };

    updateStats();
    window.addEventListener('lecturelens_storage_updated', updateStats);
    window.addEventListener('lecturelens_settings_updated', updateStats);
    return () => {
      window.removeEventListener('lecturelens_storage_updated', updateStats);
      window.removeEventListener('lecturelens_settings_updated', updateStats);
    };
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Create Notes', href: '/upload', icon: PlusCircle, isAction: true },
    { name: 'My Lectures', href: '/lectures', icon: BookOpen, badge: lectureCount },
    { name: 'Flashcards', href: '/flashcards', icon: Layers },
    { name: 'Practice Quiz', href: '/quiz', icon: HelpCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-3 left-4 z-50 flex items-center gap-2">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        aria-label="Application Sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white/95 dark:bg-[#0b101b]/95 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/70 flex items-center justify-between">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
            aria-label="LectureLens Dashboard Home"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-800 border border-slate-700/60 flex items-center justify-center text-white shadow-sm group-hover:border-indigo-500/80 transition-colors">
              <Compass className="w-4 h-4 text-indigo-400 group-hover:rotate-45 transition-transform" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                  Lecture<span className="text-indigo-600 dark:text-indigo-400">Lens</span>
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Academic Study Platform</p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav aria-label="Main Navigation" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (item.isAction) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className="flex items-center justify-between px-3.5 py-2.5 my-2.5 rounded-xl text-xs font-semibold transition-all duration-150 bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/20 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-white" aria-hidden="true" />
                    <span>{item.name}</span>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-200" aria-hidden="true" />
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white font-semibold border border-slate-200/80 dark:border-slate-700/60 shadow-subtle'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    aria-hidden="true"
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                        : 'bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* AI Engine Status Card */}
        <div className="p-3 mx-3 mb-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                {engineStatus}
              </span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            {keyType}
          </p>
        </div>

        {/* Footer with Theme Toggle */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between text-xs text-slate-400">
          <span>v1.0.0</span>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </aside>
    </>
  );
}
