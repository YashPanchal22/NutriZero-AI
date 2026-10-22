import React, { useState, useEffect } from 'react';
import { LayoutDashboard, MessageSquare, Utensils, CalendarDays, Recycle, ShoppingCart, Sparkles, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { getActivityStats, getStoredSessions } from '../services/storage';
import { AppActivityStats } from '../types';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AppActivityStats>({
    conversationsCount: 1,
    recipesCount: 0,
    mealPlansCount: 0,
    wasteHacksCount: 0,
    groceryPlansCount: 0,
    lastActive: new Date().toISOString()
  });

  useEffect(() => {
    const currentStats = getActivityStats();
    const sessions = getStoredSessions();
    if (sessions.length > currentStats.conversationsCount) {
      currentStats.conversationsCount = sessions.length;
    }
    setStats(currentStats);
  }, []);

  const chartData = [
    { name: 'Chats', count: stats.conversationsCount, fill: '#10b981' },
    { name: 'Recipes', count: stats.recipesCount, fill: '#06b6d4' },
    { name: 'Meal Plans', count: stats.mealPlansCount, fill: '#8b5cf6' },
    { name: 'Waste Hacks', count: stats.wasteHacksCount, fill: '#f59e0b' },
    { name: 'Grocery Plans', count: stats.groceryPlansCount, fill: '#ec4899' },
  ];

  const pieData = [
    { name: 'Conversations', value: Math.max(stats.conversationsCount, 1), fill: '#10b981' },
    { name: 'Recipes', value: Math.max(stats.recipesCount, 1), fill: '#06b6d4' },
    { name: 'Meal Plans', value: Math.max(stats.mealPlansCount, 1), fill: '#8b5cf6' },
    { name: 'Waste Saved', value: Math.max(stats.wasteHacksCount, 1), fill: '#f59e0b' },
  ];

  const estimatedMealsPlanned = (stats.mealPlansCount * 3) + (stats.recipesCount * 2) + 1;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-surface-950">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-brand-950/40 via-surface-900 to-indigo-950/30 border border-brand-500/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-400">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">Impact & Activity Dashboard</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Tracking your real household nutrition actions, meal planning metrics, and food-waste reduction history.
              </p>
            </div>
          </div>
        </div>

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-surface-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Chats</span>
              <MessageSquare className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="font-display text-2xl font-bold text-white">{stats.conversationsCount}</div>
            <span className="text-[10px] text-slate-500 mt-1">Saved Sessions</span>
          </div>

          <div className="bg-surface-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Recipes</span>
              <Utensils className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="font-display text-2xl font-bold text-white">{stats.recipesCount}</div>
            <span className="text-[10px] text-slate-500 mt-1">Pantry Creations</span>
          </div>

          <div className="bg-surface-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Meal Plans</span>
              <CalendarDays className="w-4 h-4 text-purple-400" />
            </div>
            <div className="font-display text-2xl font-bold text-white">{stats.mealPlansCount}</div>
            <span className="text-[10px] text-slate-500 mt-1">Budget Schedules</span>
          </div>

          <div className="bg-surface-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Waste Hacks</span>
              <Recycle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="font-display text-2xl font-bold text-white">{stats.wasteHacksCount}</div>
            <span className="text-[10px] text-slate-500 mt-1">Leftovers Saved</span>
          </div>

          <div className="bg-surface-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Est. Meals</span>
              <Sparkles className="w-4 h-4 text-rose-400" />
            </div>
            <div className="font-display text-2xl font-bold text-white">{estimatedMealsPlanned}</div>
            <span className="text-[10px] text-slate-500 mt-1">Planned via App</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart Activity Breakdown */}
          <div className="lg:col-span-2 bg-surface-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-400" />
                App Usage Activity Breakdown
              </h3>
              <span className="text-xs text-slate-400">Total Count</span>
            </div>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart Distribution */}
          <div className="bg-surface-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-display text-base font-bold text-white">
              Action Distribution
            </h3>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Chats</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-500" /> Recipes</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500" /> Plans</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Waste Hacks</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
