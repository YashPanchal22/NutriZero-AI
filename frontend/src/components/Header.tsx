import React, { useState, useEffect } from 'react';
import { Menu, MessageSquare, Volume2, VolumeX } from 'lucide-react';
import { getStoredSessions } from '../services/storage';
import { isVoiceMuted, toggleVoiceMute } from '../services/voice';

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
  const [muted, setMuted] = useState<boolean>(() => isVoiceMuted());

  useEffect(() => {
    const handleUpdate = () => setSessionsCount(getStoredSessions().length);
    const handleMuteChange = (e: any) => setMuted(e.detail ?? isVoiceMuted());

    window.addEventListener('nutrizero_sessions_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('nutrizero_voice_mute_changed', handleMuteChange);

    return () => {
      window.removeEventListener('nutrizero_sessions_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('nutrizero_voice_mute_changed', handleMuteChange);
    };
  }, []);

  const handleToggleMute = () => {
    const next = toggleVoiceMute();
    setMuted(next);
  };

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
            src="./logo.png"
            alt="NutritionAI Logo"
            className="w-7 h-7 rounded-lg object-cover border border-emerald-500/30 flex-shrink-0 shadow-sm"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <h1 className="font-display font-semibold text-sm lg:text-base text-white tracking-wide truncate">
            {title}
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Live Demo
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Voice Mute / Unmute Button */}
        <button
          type="button"
          onClick={handleToggleMute}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all active:scale-95 shadow-sm ${
            muted
              ? 'bg-rose-950/40 text-rose-300 border-rose-800/40 hover:bg-rose-900/60'
              : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40 hover:bg-emerald-900/60'
          }`}
          title={muted ? 'Voice is Muted (Click to Unmute)' : 'Voice is Active (Click to Mute)'}
        >
          {muted ? (
            <VolumeX className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          )}
          <span className="hidden sm:inline">{muted ? 'Muted' : 'Voice'}</span>
        </button>

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
