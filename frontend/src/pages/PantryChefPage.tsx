import React, { useState } from 'react';
import { Utensils, Plus, X, Sparkles, Loader2, DollarSign, HeartPulse, Recycle, Volume2 } from 'lucide-react';
import { apiClient } from '../api/client';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { speakAIResponse, stopSpeech } from '../services/voice';
import { incrementActivityStat } from '../services/storage';

export const PantryChefPage: React.FC = () => {
  const [ingredients, setIngredients] = useState<string[]>(['Rice', 'Dal', 'Onion', 'Potato']);
  const [newIngredient, setNewIngredient] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recipeResult, setRecipeResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const quickStaples = ['Tomato', 'Egg', 'Soya Chunks', 'Coriander', 'Spinach', 'Peanuts', 'Garlic'];

  const addIngredient = (item: string) => {
    const trimmed = item.trim();
    if (trimmed && !ingredients.some(i => i.toLowerCase() === trimmed.toLowerCase())) {
      setIngredients([...ingredients, trimmed]);
      setNewIngredient('');
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleGenerateRecipe = async () => {
    if (ingredients.length === 0 || isLoading) return;
    setIsLoading(true);
    setError(null);
    stopSpeech();

    try {
      const res = await apiClient.post('/api/recipe', {
        ingredients: ingredients
      });

      const reply = res.data?.reply;
      if (!reply) {
        throw new Error('No recipe generated.');
      }

      setRecipeResult(reply);
      incrementActivityStat('recipesCount');
      speakAIResponse('recipe_' + Date.now(), reply);
    } catch (err: any) {
      console.error('Pantry recipe error:', err);
      setError('Gemini AI is currently unavailable. Please check the backend connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-surface-950">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Banner */}
        <div className="bg-gradient-to-r from-brand-900/40 via-surface-900 to-cyanAccent-950/30 border border-brand-500/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-400">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">Pantry Chef</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Transform ingredients you already own into delicious, low-cost, zero-waste recipes.
              </p>
            </div>
          </div>
        </div>

        {/* Ingredients Builder */}
        <div className="bg-surface-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Your Available Pantry Ingredients:
          </h3>

          {/* Active Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {ingredients.map((item, idx) => (
              <span
                key={idx}
                className="bg-brand-500/10 border border-brand-500/30 text-brand-300 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeIngredient(idx)}
                  className="hover:text-rose-400 rounded-full transition-colors"
                  title="Remove ingredient"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          {/* Input Box for New Ingredient */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addIngredient(newIngredient);
                }
              }}
              placeholder="Type an ingredient (e.g. Tomato, Ginger, Egg)..."
              className="flex-1 bg-surface-950 border border-slate-800 focus:border-brand-500/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => addIngredient(newIngredient)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {/* Quick Staple Suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
            <span className="text-xs text-slate-400 mr-1">Quick Add:</span>
            {quickStaples.map((staple, i) => (
              <button
                key={i}
                type="button"
                onClick={() => addIngredient(staple)}
                className="text-xs bg-slate-800/60 hover:bg-brand-500/10 hover:text-brand-300 text-slate-400 px-2.5 py-1 rounded-md border border-slate-700/50 transition-colors"
              >
                + {staple}
              </button>
            ))}
          </div>

          {/* Generate Button */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              disabled={isLoading || ingredients.length === 0}
              onClick={handleGenerateRecipe}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-cyanAccent-600 hover:from-brand-500 hover:to-cyanAccent-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gemini is Crafting Recipe...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Recipe</span>
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

        {/* Recipe Result Card */}
        {recipeResult && (
          <div className="bg-surface-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-400" />
                <h3 className="font-display text-lg font-bold text-white">Your Custom Recipe</h3>
              </div>
              <button
                type="button"
                onClick={() => speakAIResponse('recipe_read_' + Date.now(), recipeResult)}
                className="text-xs bg-slate-800 hover:bg-brand-500/20 text-slate-300 hover:text-brand-300 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
                title="Read recipe aloud"
              >
                <Volume2 className="w-4 h-4" />
                <span>Listen Aloud</span>
              </button>
            </div>

            <div className="bg-surface-950/60 rounded-xl p-5 border border-slate-800/60">
              <MarkdownRenderer content={recipeResult} />
            </div>

            {/* SDG 2 Highlights Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-start gap-2.5">
                <DollarSign className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold text-slate-200">Budget Conscious</div>
                  <div className="text-slate-400">Uses low-cost kitchen staples to maximize savings.</div>
                </div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-start gap-2.5">
                <HeartPulse className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold text-slate-200">Wholesome Nutrition</div>
                  <div className="text-slate-400">Balances energy, dietary fiber, and plant proteins.</div>
                </div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-start gap-2.5">
                <Recycle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold text-slate-200">Zero Waste</div>
                  <div className="text-slate-400">Repurposes peels, stems, and leftover portions.</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
