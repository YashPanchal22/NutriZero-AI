import React, { useState, useEffect } from 'react';
import { Menu, Sparkles, MessageSquare } from 'lucide-react';
import { getStoredSessions } from '../services/storage';

interface HeaderProps {
  onOpenSidebar: () => void;
  onOpenHistory?: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSidebar,
  onOpenHistory,
  title = 'AI Food & Nutrition Assistant',
}) => {
  const [sessionsCount, setSessionsCount] = useState<number>(() => getStoredSessions().length);

  useEffect(() => {
    const handleUpdate = () => setSessionsCount(getStoredSessions().length);
    window.addEventListener('nutrizero_sessions_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('nutrizero_sessions_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return (
    <header className="h-14 border-b border-slate-800 bg-surface-900/60 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="NutritionAI Logo"
            className="w-7 h-7 rounded-lg object-cover border border-emerald-500/30 flex-shrink-0 shadow-sm"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <h1 className="font-display font-semibold text-sm lg:text-base text-white tracking-wide truncate">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {onOpenHistory && (
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all shadow-sm active:scale-95"
            title="Browse all recent chat conversations"
          >
            <MessageSquare className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
            <span className="hidden sm:inline">Recent Chats</span>
            <span className="text-[10px] bg-brand-500/20 text-brand-300 font-mono font-bold px-1.5 py-0.5 rounded">
              {sessionsCount}
            </span>
          </button>
        )}

        <span className="hidden md:inline-block text-xs text-slate-400 border border-slate-800 bg-slate-900/80 px-2.5 py-1 rounded-full">
          🌱 UN SDG 2 Zero Hunger
        </span>
      </div>
    </header>
  );
};
