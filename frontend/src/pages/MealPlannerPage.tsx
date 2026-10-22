import React, { useState } from 'react';
import { CalendarDays, Users, IndianRupee, Sparkles, Loader2, Volume2, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../api/client';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { speakAIResponse, stopSpeech } from '../services/voice';
import { incrementActivityStat } from '../services/storage';

export const MealPlannerPage: React.FC = () => {
  const [budget, setBudget] = useState('₹150');
  const [people, setPeople] = useState(2);
  const [diet, setDiet] = useState('Vegetarian');
  const [isLoading, setIsLoading] = useState(false);
  const [mealPlanResult, setMealPlanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const budgetOptions = ['₹50', '₹100', '₹150', '₹200', '₹300'];
  const peopleOptions = [1, 2, 3, 4, 5];
  const dietOptions = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'High Protein (Budget)'];

  const handleGenerateMealPlan = async () => {
    setIsLoading(true);
    setError(null);
    stopSpeech();

    try {
      const res = await apiClient.post('/api/meal-plan', {
        budget: budget,
        people: people,
        diet: diet
      });

      const reply = res.data?.reply;
      if (!reply) {
        throw new Error('No meal plan returned.');
      }

      setMealPlanResult(reply);
      incrementActivityStat('mealPlansCount');
      speakAIResponse('mealplan_' + Date.now(), reply);
    } catch (err: any) {
      console.error('Meal plan error:', err);
      setError('Gemini AI is currently unavailable. Please check the backend connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-surface-950">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-950/50 via-surface-900 to-teal-950/40 border border-emerald-500/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">Budget Meal Planner</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Generate practical daily meal plans tailored to your exact budget, household size, and diet.
              </p>
            </div>
          </div>
        </div>

        {/* Input Parameters Box */}
        <div className="bg-surface-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {/* Target Budget */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
              <IndianRupee className="w-4 h-4 text-emerald-400" /> Target Budget (Per Day):
            </label>
            <div className="grid grid-cols-5 gap-2">
              {budgetOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setBudget(opt)}
                  className={`py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                    budget === opt
                      ? 'bg-brand-500/20 border-brand-400 text-brand-300 shadow-md shadow-brand-500/20'
                      : 'bg-surface-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* People Count */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
              <Users className="w-4 h-4 text-cyan-400" /> Household Size (People):
            </label>
            <div className="grid grid-cols-5 gap-2">
              {peopleOptions.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPeople(num)}
                  className={`py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                    people === num
                      ? 'bg-cyanAccent-500/20 border-cyanAccent-400 text-cyan-300 shadow-md shadow-cyanAccent-500/20'
                      : 'bg-surface-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {num === 5 ? '5+' : num} {num === 1 ? 'Person' : 'People'}
                </button>
              ))}
            </div>
          </div>

          {/* Diet Preference */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-400" /> Dietary Preference:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {dietOptions.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDiet(d)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                    diet === d
                      ? 'bg-brand-500/20 border-brand-400 text-brand-300 shadow-sm'
                      : 'bg-surface-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGenerateMealPlan}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Calculating Meal Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Meal Plan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 text-sm text-rose-300">
            {error}
          </div>
        )}

        {/* Result Card */}
        {mealPlanResult && (
          <div className="bg-surface-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="font-display text-lg font-bold text-white">
                  1-Day Plan for {people} ({budget} Total)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => speakAIResponse('plan_read_' + Date.now(), mealPlanResult)}
                className="text-xs bg-slate-800 hover:bg-brand-500/20 text-slate-300 hover:text-brand-300 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
                title="Read plan aloud"
              >
                <Volume2 className="w-4 h-4" />
                <span>Listen Aloud</span>
              </button>
            </div>

            <div className="bg-surface-950/60 rounded-xl p-5 border border-slate-800/60">
              <MarkdownRenderer content={mealPlanResult} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
