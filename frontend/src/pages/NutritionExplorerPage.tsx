import React, { useState, useEffect } from 'react';
import { Apple, Search, Sparkles, Loader2, Info, TrendingUp, Zap, Shield, Heart } from 'lucide-react';
import { apiClient } from '../api/client';
import { NutritionStaple } from '../types';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { speakAIResponse, stopSpeech } from '../services/voice';

export const NutritionExplorerPage: React.FC = () => {
  const [staples, setStaples] = useState<NutritionStaple[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedFood, setSelectedFood] = useState<NutritionStaple | null>(null);
  const [customFoodQuery, setCustomFoodQuery] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    apiClient.get('/api/nutrition-data')
      .then(res => {
        if (res.data?.staples) {
          setStaples(res.data.staples);
          setSelectedFood(res.data.staples[0]);
        }
      })
      .catch(err => {
        console.warn('Failed to load baseline nutrition dataset', err);
      });
  }, []);

  const handleCustomNutritionSearch = async (item?: string) => {
    const query = (item || customFoodQuery).trim();
    if (!query || isLoading) return;

    setIsLoading(true);
    setAiAnalysis(null);
    stopSpeech();

    try {
      const res = await apiClient.post('/api/chat', {
        message: `Provide an approximate nutritional breakdown for "${query}" per standard serving portion. Include approximate Calories, Protein, Carbohydrates, Healthy Fats, Fiber, and key micronutrients (Vitamins/Minerals). State that values are approximate estimates.`
      });

      const reply = res.data?.reply;
      if (reply) {
        setAiAnalysis(reply);
        speakAIResponse('nutri_' + Date.now(), reply);
      }
    } catch (err: any) {
      console.error('Custom food nutrition error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStaples = staples.filter(s =>
    s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    s.keyNutrients.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-surface-950">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-surface-900 to-cyanAccent-950/30 border border-brand-500/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-400">
              <Apple className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">Nutrition Explorer</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Transparent macronutrient and micronutrient profiles for budget staples. Values are approximate guidelines.
              </p>
            </div>
          </div>
        </div>

        {/* AI Food Lookup */}
        <div className="bg-surface-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" /> Explore Any Food with Gemini AI:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customFoodQuery}
              onChange={(e) => setCustomFoodQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCustomNutritionSearch();
                }
              }}
              placeholder="e.g. Soya chunks, Rajma, Oats, Papaya..."
              className="flex-1 bg-surface-950 border border-slate-800 focus:border-brand-500/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors"
            />
            <button
              type="button"
              disabled={isLoading || !customFoodQuery.trim()}
              onClick={() => handleCustomNutritionSearch()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Inspect Nutrition</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {['Rice', 'Dal', 'Egg', 'Banana', 'Milk', 'Potato'].map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setCustomFoodQuery(item);
                  handleCustomNutritionSearch(item);
                }}
                className="text-xs bg-slate-800/60 hover:bg-brand-500/10 hover:text-brand-300 text-slate-400 px-2.5 py-1 rounded-md border border-slate-700/60 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* AI Result Card */}
        {aiAnalysis && (
          <div className="bg-surface-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-3">
            <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Nutritional Profile: {customFoodQuery}
            </h3>
            <div className="bg-surface-950/60 rounded-xl p-4 border border-slate-800/60">
              <MarkdownRenderer content={aiAnalysis} />
            </div>
          </div>
        )}

        {/* Baseline Common Food Database */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-display text-base font-bold text-white">
              Baseline Verified Pantry Database
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search common foods..."
                className="w-full bg-surface-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500/60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaples.map((staple) => (
              <div
                key={staple.id}
                className="bg-surface-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-white text-sm">{staple.name}</h4>
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {staple.costPerPortion}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mb-3">{staple.portion}</span>

                  {/* Macros Grid */}
                  <div className="grid grid-cols-4 gap-2 text-center py-2 px-1 bg-surface-950 rounded-xl border border-slate-800/60 mb-3">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Calories</div>
                      <div className="text-xs font-bold text-white mt-0.5">{staple.calories}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Protein</div>
                      <div className="text-xs font-bold text-emerald-400 mt-0.5">{staple.protein}g</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Carbs</div>
                      <div className="text-xs font-bold text-cyan-400 mt-0.5">{staple.carbs}g</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Fats</div>
                      <div className="text-xs font-bold text-amber-400 mt-0.5">{staple.fat}g</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 leading-relaxed mb-2">
                    <strong className="text-slate-400">Key Nutrients:</strong> {staple.keyNutrients}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 italic">
                  🌱 {staple.sdgRole}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
