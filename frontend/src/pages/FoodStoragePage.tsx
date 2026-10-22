import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Sparkles, Loader2, Volume2, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { apiClient } from '../api/client';
import { StorageGuideline } from '../types';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { speakAIResponse, stopSpeech } from '../services/voice';

export const FoodStoragePage: React.FC = () => {
  const [guidelines, setGuidelines] = useState<StorageGuideline[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [customQuery, setCustomQuery] = useState('');
  const [customResult, setCustomResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get('/api/food-storage')
      .then(res => {
        if (res.data?.guidelines) {
          setGuidelines(res.data.guidelines);
        }
      })
      .catch(err => {
        console.warn('Failed to load storage guidelines', err);
      });
  }, []);

  const handleAskStorage = async (queryText?: string) => {
    const q = (queryText || customQuery).trim();
    if (!q || isLoading) return;

    setIsLoading(true);
    setError(null);
    stopSpeech();

    try {
      const res = await apiClient.post('/api/chat', {
        message: `Provide safe food storage guidelines for: ${q}. Include duration, container type, optimal temperature/shelf, and food-safety indicators.`
      });

      const reply = res.data?.reply;
      if (reply) {
        setCustomResult(reply);
        speakAIResponse('storage_' + Date.now(), reply);
      }
    } catch (err: any) {
      console.error('Storage query error:', err);
      setError('Gemini AI is currently unavailable. Please check the backend connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGuidelines = guidelines.filter(g =>
    g.item.toLowerCase().includes(searchFilter.toLowerCase()) ||
    g.safetyRule.toLowerCase().includes(searchFilter.toLowerCase()) ||
    g.location.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-surface-950">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-teal-950/40 via-surface-900 to-emerald-950/30 border border-teal-500/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">Food Storage & Safety Guide</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Safe storage prevents bacterial proliferation, locks in nutrients, and extends shelf life.
              </p>
            </div>
          </div>
        </div>

        {/* Ask AI Storage Assistant */}
        <div className="bg-surface-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" /> Ask AI How to Store Any Food:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAskStorage();
                }
              }}
              placeholder="e.g. How should I store cooked rice? How to freeze chopped palak?"
              className="flex-1 bg-surface-950 border border-slate-800 focus:border-brand-500/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors"
            />
            <button
              type="button"
              disabled={isLoading || !customQuery.trim()}
              onClick={() => handleAskStorage()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Ask Assistant</span>
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {["How should I store cooked rice?", "How should I store vegetables?", "How should I store leftovers?"].map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCustomQuery(q);
                  handleAskStorage(q);
                }}
                className="text-xs bg-slate-800/60 hover:bg-brand-500/10 hover:text-brand-300 text-slate-400 px-3 py-1 rounded-full border border-slate-700/60 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* AI Answer Display */}
        {customResult && (
          <div className="bg-surface-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> AI Storage Guidance
              </span>
              <button
                type="button"
                onClick={() => speakAIResponse('storage_read_' + Date.now(), customResult)}
                className="text-xs bg-slate-800 hover:bg-brand-500/20 text-slate-300 hover:text-brand-300 px-3 py-1 rounded-lg border border-slate-700 flex items-center gap-1 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" /> Listen
              </button>
            </div>
            <div className="bg-surface-950/60 rounded-xl p-4 border border-slate-800/60">
              <MarkdownRenderer content={customResult} />
            </div>
          </div>
        )}

        {/* Verified Guidelines Reference Cards */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
              <span>Standard Kitchen Staples Guidelines</span>
              <span className="text-xs font-normal text-slate-400">({guidelines.length} items verified)</span>
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter guidelines (e.g. rice, onions)..."
                className="w-full bg-surface-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500/60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGuidelines.map((item, idx) => (
              <div
                key={idx}
                className="bg-surface-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-white text-sm">{item.item}</h4>
                  <span className="text-xs bg-brand-500/10 text-brand-300 font-medium px-2.5 py-0.5 rounded-full border border-brand-500/30 whitespace-nowrap">
                    ⏱️ {item.duration}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  <strong className="text-slate-300">Optimal Placement:</strong> {item.location}
                </div>
                <div className="bg-surface-950 rounded-xl p-3 text-xs text-slate-300 border border-slate-800/70 leading-relaxed flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>{item.safetyRule}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
