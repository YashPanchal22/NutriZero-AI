import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Trash2,
  X,
  Search,
  Clock,
  ArrowRight,
  Plus,
  AlertCircle
} from 'lucide-react';
import { ConversationSession } from '../types';
import { getStoredSessions, deleteStoredSession, clearAllStoredSessions } from '../services/storage';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  currentSessionId,
  onSelectSession,
  onNewChat,
}) => {
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const refreshSessions = () => {
    setSessions(getStoredSessions());
  };

  useEffect(() => {
    if (isOpen) {
      refreshSessions();
      setSearchQuery('');
      setConfirmClearAll(false);
      const handleUpdate = () => refreshSessions();
      window.addEventListener('nutrizero_sessions_updated', handleUpdate);
      window.addEventListener('storage', handleUpdate);
      return () => {
        window.removeEventListener('nutrizero_sessions_updated', handleUpdate);
        window.removeEventListener('storage', handleUpdate);
      };
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase().trim();
    return sessions.filter((s) => {
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchContent = s.messages.some((m) =>
        m.content.toLowerCase().includes(q)
      );
      return matchTitle || matchContent;
    });
  }, [sessions, searchQuery]);

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteStoredSession(id);
    refreshSessions();
    if (currentSessionId === id) {
      onNewChat();
    }
  };

  const handleClearAll = () => {
    clearAllStoredSessions();
    setSessions([]);
    setConfirmClearAll(false);
    onNewChat();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="All Recent Chats History"
    >
      <div
        className="bg-surface-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-surface-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-white flex items-center gap-2">
                All Recent Chats
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                  {sessions.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Browse, search, and resume your previous conversations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onNewChat();
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Start a fresh chat"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-800 bg-surface-900 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chat titles or conversation messages..."
              className="w-full pl-9 pr-8 py-2 bg-surface-950 border border-slate-800 focus:border-brand-500/60 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {sessions.length > 0 && !confirmClearAll && (
            <button
              type="button"
              onClick={() => setConfirmClearAll(true)}
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 flex items-center justify-center gap-1.5 transition-colors"
              title="Clear all stored sessions"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Confirm Clear All Alert */}
        {confirmClearAll && (
          <div className="p-3 mx-3 mt-3 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-center justify-between gap-3 text-xs text-rose-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>Are you sure you want to delete all {sessions.length} chats permanently?</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setConfirmClearAll(false)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold"
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        )}

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 min-h-[220px]">
          {filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <MessageSquare className="w-10 h-10 text-slate-600 mb-3 stroke-[1.5]" />
              {searchQuery ? (
                <>
                  <p className="text-sm font-medium text-slate-300">No matching conversations found</p>
                  <p className="text-xs text-slate-500 mt-1">Try another search term or clear the filter</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-slate-300">No conversations yet</p>
                  <p className="text-xs text-slate-500 mt-1">Start chatting with NutriZero AI to save your chats</p>
                </>
              )}
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isCurrent = session.id === currentSessionId;
              const dateStr = new Date(session.updatedAt || session.createdAt).toLocaleDateString(
                undefined,
                { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
              );
              const userMessages = session.messages.filter((m) => m.role === 'user');
              const lastMessage = session.messages[session.messages.length - 1];
              const snippet = lastMessage ? lastMessage.content.slice(0, 140) : '';

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    onClose();
                  }}
                  className={`group relative p-3 sm:p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isCurrent
                      ? 'bg-brand-500/10 border-brand-500/40 shadow-sm'
                      : 'bg-surface-950/60 hover:bg-surface-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquare
                        className={`w-4 h-4 flex-shrink-0 ${
                          isCurrent ? 'text-brand-400' : 'text-slate-500 group-hover:text-brand-400'
                        }`}
                      />
                      <h3
                        className={`text-sm font-semibold truncate ${
                          isCurrent ? 'text-brand-300' : 'text-white group-hover:text-brand-300'
                        }`}
                      >
                        {session.title}
                      </h3>
                      {isCurrent && (
                        <span className="text-[10px] bg-brand-500/20 text-brand-300 border border-brand-500/30 px-1.5 py-0.5 rounded font-medium">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(e, session.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        className="px-2.5 py-1 rounded-lg bg-slate-800 group-hover:bg-brand-600 text-slate-300 group-hover:text-white text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {snippet && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {snippet}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {dateStr}
                    </span>
                    <span>•</span>
                    <span>{session.messages.length} messages ({userMessages.length} questions)</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-surface-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Conversations are saved locally in your browser</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
