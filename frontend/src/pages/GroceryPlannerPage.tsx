import React, { useState } from 'react';
import { ShoppingCart, Users, IndianRupee, Sparkles, Loader2, Volume2, CheckSquare } from 'lucide-react';
import { apiClient } from '../api/client';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { speakAIResponse, stopSpeech } from '../services/voice';
import { incrementActivityStat } from '../services/storage';

export const GroceryPlannerPage: React.FC = () => {
  const [people, setPeople] = useState(2);
  const [budget, setBudget] = useState('₹500');
  const [preferences, setPreferences] = useState('Affordable staples (rice, lentils, seasonal vegetables, eggs)');
  const [isLoading, setIsLoading] = useState(false);
  const [groceryResult, setGroceryResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const budgetTiers = ['₹300', '₹500', '₹800', '₹1200', '₹2000'];

  const handleGenerateGroceryList = async () => {
    setIsLoading(true);
    setError(null);
    stopSpeech();

    try {
      const res = await apiClient.post('/api/grocery-plan', {
        people: people,
        budget: budget,
        preferences: preferences
      });

      const reply = res.data?.reply;
      if (!reply) {
        throw new Error('No grocery list returned.');
      }

      setGroceryResult(reply);
      incrementActivityStat('groceryPlansCount');
      speakAIResponse('grocery_' + Date.now(), reply);
    } catch (err: any) {
      console.error('Grocery planner error:', err);
      setError('Gemini AI is currently unavailable. Please check the backend connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-surface-950">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-cyan-950/40 via-surface-900 to-emerald-950/30 border border-cyan-500/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">Smart Grocery Planner</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Plan affordable market runs with itemized staple quantities, estimated prices, and nutrition priorities.
              </p>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="bg-surface-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          {/* People & Budget Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                <Users className="w-4 h-4 text-cyan-400" /> People in Household:
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPeople(n)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      people === n
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                        : 'bg-surface-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {n === 5 ? '5+' : n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                <IndianRupee className="w-4 h-4 text-emerald-400" /> Target Budget Limit:
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {budgetTiers.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBudget(b)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      budget === b
                        ? 'bg-brand-500/20 border-brand-400 text-brand-300 shadow-sm'
                        : 'bg-surface-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Meal Focus / Preferences */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Meal Plan / Dietary Needs Focus:
            </label>
            <input
              type="text"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="e.g. Vegetarian high protein, student essentials under ₹300, family staples..."
              className="w-full bg-surface-950 border border-slate-800 focus:border-brand-500/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGenerateGroceryList}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-brand-600 hover:from-cyan-500 hover:to-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Calculating Quantities & Costs...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Grocery Checklist</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 text-sm text-rose-300">
            {error}
          </div>
        )}

        {/* Grocery Results Card */}
        {groceryResult && (
          <div className="bg-surface-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-cyan-400" />
                <h3 className="font-display text-lg font-bold text-white">
                  Estimated Grocery Plan ({people} People · {budget})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => speakAIResponse('grocery_read_' + Date.now(), groceryResult)}
                className="text-xs bg-slate-800 hover:bg-brand-500/20 text-slate-300 hover:text-brand-300 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
                title="Read grocery list aloud"
              >
                <Volume2 className="w-4 h-4" />
                <span>Listen Aloud</span>
              </button>
            </div>

            <div className="bg-surface-950/60 rounded-xl p-5 border border-slate-800/60">
              <MarkdownRenderer content={groceryResult} />
            </div>

            <div className="text-[11px] text-slate-400 italic bg-surface-950 p-3 rounded-lg border border-slate-800/80">
              * Prices are estimated approximate local retail market rates. Actual prices vary by region and seasonal produce availability.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
