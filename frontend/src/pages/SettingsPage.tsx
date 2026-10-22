import React, { useState, useEffect } from 'react';
import { Settings, Trash2, CheckCircle2, AlertCircle, RefreshCw, Moon, Sparkles, Database, Key, Globe } from 'lucide-react';
import { apiClient } from '../api/client';
import { clearAllStoredSessions } from '../services/storage';

export const SettingsPage: React.FC = () => {
  const [geminiStatus, setGeminiStatus] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);
  const [customApiKey, setCustomApiKey] = useState<string>(() => localStorage.getItem('nutrizero_gemini_api_key') || '');
  const [keySavedNotice, setKeySavedNotice] = useState(false);

  const checkGemini = async () => {
    setIsChecking(true);
    try {
      const res = await apiClient.get('/api/gemini-status');
      setGeminiStatus(res.data);
    } catch (err: any) {
      setGeminiStatus({
        connected: false,
        provider: 'Google Gemini',
        message: 'Backend server or Gemini connection failed'
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkGemini();
  }, []);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to delete all saved conversations and cached activity?')) {
      clearAllStoredSessions();
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 4000);
    }
  };

  const handleSaveApiKey = () => {
    if (customApiKey.trim()) {
      localStorage.setItem('nutrizero_gemini_api_key', customApiKey.trim());
    } else {
      localStorage.removeItem('nutrizero_gemini_api_key');
    }
    setKeySavedNotice(true);
    setTimeout(() => setKeySavedNotice(false), 3000);
    checkGemini();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-surface-950">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-surface-900 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">Application Settings</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Manage backend AI connection, standalone demo mode, themes, and conversation history.
              </p>
            </div>
          </div>
        </div>

        {/* GitHub Pages Live Demo Status Card */}
        <div className="bg-surface-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-white text-sm">Deployment & Demo Mode</h3>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> GitHub Pages Standalone
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            NutriZero AI is configured with an offline-first client engine. All features (Chat, Pantry Chef, Budget Meal Planner, Food Waste Reducer, Food Storage, Nutrition Explorer, and Grocery Planner) work directly in your browser without requiring a backend server.
          </p>

          {/* Optional Direct Gemini API Key */}
          <div className="bg-surface-950 rounded-xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-brand-400" />
                <span className="text-xs font-medium text-slate-200">Optional: Custom Google Gemini API Key</span>
              </div>
              <span className="text-[10px] text-slate-400">Stored in browser localStorage only</span>
            </div>
            <p className="text-[11px] text-slate-400">
              If you want live real-time Gemini AI queries directly in your browser (without relying on the built-in offline generator), paste a free key from Google AI Studio here:
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                className="flex-1 bg-surface-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
              />
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95 flex-shrink-0"
              >
                Save Key
              </button>
            </div>
            {keySavedNotice && (
              <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> API Key saved successfully. Direct browser Gemini integration active.
              </div>
            )}
          </div>
        </div>

        {/* Gemini AI Status Card */}
        <div className="bg-surface-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              <h3 className="font-semibold text-white text-sm">AI Engine Status</h3>
            </div>
            <button
              type="button"
              disabled={isChecking}
              onClick={checkGemini}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>Test Status</span>
            </button>
          </div>

          <div className="bg-surface-950 rounded-xl p-4 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Connection State:</span>
              {geminiStatus?.connected ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active & Operational
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  <AlertCircle className="w-3.5 h-3.5" /> Standalone Demo Mode Active
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">AI Provider:</span>
              <span className="text-slate-200 font-medium">{geminiStatus?.provider || 'NutriZero AI Engine'}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Model:</span>
              <span className="text-brand-400 font-mono font-medium">{geminiStatus?.model || 'gemini-1.5-flash / Offline Zero Hunger AI'}</span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/50">
              <span className="text-slate-400">Status Info:</span>
              <span className="text-slate-300 font-medium truncate max-w-[280px]">
                {geminiStatus?.message || 'Ready to serve nutrition and zero-waste requests'}
              </span>
            </div>
          </div>
        </div>

        {/* Theme Card */}
        <div className="bg-surface-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Moon className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-white text-sm">Theme & Visual Identity</h3>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="text-xs font-medium text-slate-200">Active Theme: Midnight Dark</div>
              <div className="text-[11px] text-slate-400">Tailored with high-contrast emerald & cyan accents for SDG 2.</div>
            </div>
            <span className="text-xs px-2.5 py-1 bg-brand-500/10 text-brand-300 rounded-lg border border-brand-500/20 font-medium">
              Dark Mode (Active)
            </span>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-surface-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Database className="w-4 h-4 text-rose-400" />
            <h3 className="font-semibold text-white text-sm">Data & Privacy</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            All conversations and stats are saved locally on your browser in localStorage. No personal data is sent to external servers.
          </p>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-300">Clear all chat sessions and activity metrics:</span>
            <button
              type="button"
              onClick={handleClearHistory}
              className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>

          {clearedNotice && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> All local conversations and stats have been cleared successfully.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
