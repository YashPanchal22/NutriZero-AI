import React, { useState, useEffect } from 'react';
import { Globe2, ShieldCheck, HeartPulse, Recycle, Sprout, Target, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../api/client';
import { SDGInfo } from '../types';

export const SDG2Page: React.FC = () => {
  const [sdgInfo, setSdgInfo] = useState<SDGInfo | null>(null);

  useEffect(() => {
    apiClient.get('/api/sdg-info')
      .then(res => {
        if (res.data) {
          setSdgInfo(res.data);
        }
      })
      .catch(err => {
        console.warn('Failed to load SDG info', err);
      });
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-surface-950">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-brand-950/60 via-surface-900 to-cyan-950/40 border border-brand-500/20 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold uppercase tracking-wider">
              <Globe2 className="w-3.5 h-3.5" /> United Nations Sustainable Development Goal 2
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Zero Hunger: Nutrition & Food Security for All
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              SDG 2 aims to end all forms of hunger and malnutrition by 2030, making sure all people—especially children and the most vulnerable—have access to sufficient, safe, and nutritious food all year round.
            </p>
          </div>
        </div>

        {/* The 4 Pillars of Food Security */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-400" />
            <h2 className="font-display text-lg sm:text-xl font-bold text-white">
              The 4 Core Pillars of Food Security
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sdgInfo?.pillars ? (
              sdgInfo.pillars.map((pillar, i) => (
                <div
                  key={i}
                  className="bg-surface-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2 text-brand-400 font-semibold text-sm">
                    <span className="w-6 h-6 rounded-full bg-brand-500/10 flex items-center justify-center text-xs font-bold border border-brand-500/20">
                      {i + 1}
                    </span>
                    <h4>{pillar.name}</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-8">
                    {pillar.description}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500">Loading pillars...</div>
            )}
          </div>
        </div>

        {/* Nutrition Security vs Food Security */}
        <div className="bg-surface-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <HeartPulse className="w-5 h-5" />
            <h2 className="font-display text-lg font-bold text-white">
              Food Security vs. Nutrition Security
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-surface-950 p-5 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="font-semibold text-white text-sm">Food Security (Caloric Sufficiency)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Having physical and economic access to sufficient food quantities to meet daily energy needs. However, consuming enough calories alone does not protect against hidden hunger if diets lack vital micronutrients.
              </p>
            </div>
            <div className="bg-surface-950 p-5 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="font-semibold text-white text-sm">Nutrition Security (Biological Nourishment)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Consistent access to dietary diversity: essential proteins, vitamins (A, C, D, B12), and minerals (iron, zinc, calcium) paired with clean water and sanitation to support healthy growth and immune defense.
              </p>
            </div>
          </div>
        </div>

        {/* Why Food Waste Matters */}
        <div className="bg-surface-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Recycle className="w-5 h-5" />
            <h2 className="font-display text-lg font-bold text-white">Why Food Waste Matters</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            According to the UN Food and Agriculture Organization (FAO), roughly one-third of all food produced worldwide—about 1.3 billion tonnes—is wasted. This represents billions in wasted household spending and substantial environmental strain.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {sdgInfo?.foodWasteFacts?.map((fact, i) => (
              <div key={i} className="bg-surface-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                💡 {fact}
              </div>
            ))}
          </div>
        </div>

        {/* What Individuals Can Do */}
        <div className="bg-surface-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-brand-400">
            <Sprout className="w-5 h-5" />
            <h2 className="font-display text-lg font-bold text-white">
              Actionable Sustainable Practices for Everyone
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {sdgInfo?.individualActions?.map((act, idx) => (
              <div key={idx} className="bg-surface-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="font-semibold text-white text-xs flex items-center gap-1.5 text-brand-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                  <span>{act.action}</span>
                </div>
                <div className="text-xs text-slate-400 leading-relaxed pl-5">{act.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* UN Key Targets */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            <h2 className="font-display text-lg sm:text-xl font-bold text-white">
              Official UN SDG 2 Targets
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sdgInfo?.keyTargets?.map((t, idx) => (
              <div key={idx} className="bg-surface-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    {t.code}
                  </span>
                  <span className="text-[11px] text-slate-500">Target 2030</span>
                </div>
                <h4 className="font-semibold text-white text-sm">{t.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
