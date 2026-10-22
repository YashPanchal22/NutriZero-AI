import React, { useState } from 'react';
import { Recycle, Sparkles, Loader2, Volume2, Lightbulb, ShieldAlert, ArrowRight } from 'lucide-react';
import { apiClient } from '../api/client';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { speakAIResponse, stopSpeech } from '../services/voice';
import { incrementActivityStat } from '../services/storage';

export const FoodWastePage: React.FC = () => {
  const [leftover, setLeftover] = useState('leftover rice');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const commonLeftovers = [
    'leftover rice',
    'cooked dal',
    'stale bread / rotis',
    'vegetable peel scraps',
    'sour curd / dahi',
    'boiled potatoes',
    'overripe bananas',
  ];

  const handleReduceWaste = async (itemToQuery?: string) => {
    const query = (itemToQuery || leftover).trim();
    if (!query || isLoading) return;

    setIsLoading(true);
    setError(null);
    stopSpeech();

    try {
      const res = await apiClient.post('/api/food-waste', {
        leftover: query
      });

      const reply = res.data?.reply;
      if (!reply) {
        throw new Error('No suggestions returned.');
      }

      setResult(reply);
      incrementActivityStat('wasteHacksCount');
      speakAIResponse('waste_' + Date.now(), reply);
    } catch (err: any) {
      console.error('Food waste error:', err);
      setError('Gemini AI is currently unavailable. Please check the backend connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-surface-950">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-surface-900 to-cyanAccent-950/30 border border-brand-500/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-400">
              <Recycle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">Food Waste Reducer</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Never throw edible food away. Discover creative revival recipes, safety timelines, and zero-waste hacks.
              </p>
            </div>
          </div>
        </div>

        {/* Input Box */}
        <div className="bg-surface-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            What leftover or surplus ingredient do you have?
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={leftover}
              onChange={(e) => setLeftover(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleReduceWaste();
                }
              }}
              placeholder="e.g. leftover rice, cooked dal, overripe bananas..."
              className="flex-1 bg-surface-950 border border-slate-800 focus:border-brand-500/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors"
            />
            <button
              type="button"
              disabled={isLoading || !leftover.trim()}
              onClick={() => handleReduceWaste()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Get Rescue Ideas</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Click Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
            <span className="text-xs text-slate-400 mr-1">Common Leftovers:</span>
            {commonLeftovers.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setLeftover(item);
                  handleReduceWaste(item);
                }}
                className="text-xs bg-slate-800/60 hover:bg-brand-500/10 hover:text-brand-300 text-slate-400 px-2.5 py-1 rounded-md border border-slate-700/50 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 text-sm text-rose-300">
            {error}
          </div>
        )}

        {/* Results Card */}
        {result && (
          <div className="bg-surface-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <h3 className="font-display text-lg font-bold text-white capitalize">
                  Rescue Guide for: {leftover}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => speakAIResponse('waste_read_' + Date.now(), result)}
                className="text-xs bg-slate-800 hover:bg-brand-500/20 text-slate-300 hover:text-brand-300 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
                title="Read guide aloud"
              >
                <Volume2 className="w-4 h-4" />
                <span>Listen Aloud</span>
              </button>
            </div>

            <div className="bg-surface-950/60 rounded-xl p-5 border border-slate-800/60">
              <MarkdownRenderer content={result} />
            </div>

            {/* Practical Rule of Thumb Box */}
            <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200/90 leading-relaxed">
                <span className="font-semibold text-amber-300">Food Safety Rule:</span> Always inspect leftovers for sour odors, slimy textures, or discoloration. While reheating kills active bacteria, it does not destroy all heat-stable toxins. When in doubt, safety comes first!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
