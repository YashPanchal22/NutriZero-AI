import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Utensils,
  CalendarDays,
  Recycle,
  ShieldCheck,
  Apple,
  ShoppingCart,
  Globe2,
  LayoutDashboard,
  Settings,
  Plus,
  Trash2,
  X,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { ConversationSession } from '../types';
import { getStoredSessions, clearAllStoredSessions, deleteStoredSession } from '../services/storage';
import { apiClient } from '../api/client';
import { HistoryModal } from './HistoryModal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentSessionId,
  onSelectSession,
  onNewChat,
}) => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [geminiConnected, setGeminiConnected] = useState<boolean | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Load sessions from storage
  const loadSessions = () => {
    setSessions(getStoredSessions());
  };

  useEffect(() => {
    loadSessions();
    const handleUpdate = () => loadSessions();
    window.addEventListener('nutrizero_sessions_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    const interval = setInterval(loadSessions, 2000);
    return () => {
      window.removeEventListener('nutrizero_sessions_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  // Check Gemini Status
  useEffect(() => {
    apiClient.get('/api/gemini-status')
      .then(res => {
        setGeminiConnected(res.data?.connected === true);
      })
      .catch(() => {
        setGeminiConnected(false);
      });
  }, []);

  const handleClearAll = () => {
    clearAllStoredSessions();
    setSessions([]);
    setShowClearConfirm(false);
    onNewChat();
  };

  const navLinks = [
    { to: '/', label: 'AI Chatbot', icon: MessageSquare },
    { to: '/pantry-chef', label: 'Pantry Chef', icon: Utensils },
    { to: '/meal-planner', label: 'Budget Meal Planner', icon: CalendarDays },
    { to: '/food-waste', label: 'Food Waste Reducer', icon: Recycle },
    { to: '/food-storage', label: 'Food Storage Guide', icon: ShieldCheck },
    { to: '/nutrition-explorer', label: 'Nutrition Explorer', icon: Apple },
    { to: '/grocery-planner', label: 'Grocery Planner', icon: ShoppingCart },
    { to: '/sdg-2', label: 'SDG 2 Zero Hunger', icon: Globe2 },
    { to: '/dashboard', label: 'Impact Dashboard', icon: LayoutDashboard },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-surface-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header / Brand */}
        <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-emerald-500/40 shadow-lg shadow-emerald-500/20 flex-shrink-0 bg-surface-950 flex items-center justify-center p-0.5 group">
              <img
                src="./logo.png"
                alt="NutritionAI Logo"
                className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold text-base text-white flex items-center gap-1.5 leading-tight truncate">
                <span>Nutrition<span className="text-emerald-400">AI</span></span>
                <span className="text-[9px] bg-emerald-500/15 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                  PRO
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    geminiConnected === true
                      ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
                      : geminiConnected === false
                      ? 'bg-amber-400 shadow-sm shadow-amber-400'
                      : 'bg-slate-500 animate-pulse'
                  }`}
                />
                <span className="text-[11px] font-medium text-slate-400 truncate">
                  {geminiConnected === true ? 'Eat Smart · Live Well' : geminiConnected === false ? 'API Check Needed' : 'Checking AI...'}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors"
            title="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Action */}
        <div className="p-3">
          <button
            type="button"
            onClick={() => {
              onNewChat();
              navigate('/');
              onClose();
            }}
            className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Recent Conversations History */}
        <div className="px-3 flex-1 overflow-y-auto min-h-0 py-2">
          <div className="flex items-center justify-between px-2 mb-2">
            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className="text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-brand-300 flex items-center gap-1.5 transition-colors group"
              title="Click to view all recent chats"
            >
              <span>Recent Chats</span>
              <span className="text-[10px] font-mono bg-slate-800 group-hover:bg-brand-500/20 text-slate-400 group-hover:text-brand-300 px-1.5 py-0.5 rounded font-bold">
                {sessions.length}
              </span>
            </button>
            {sessions.length > 0 && (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
                title="Clear all chat history"
              >
                <Trash2 className="w-3 h-3" />
                <span className="text-[11px]">Clear</span>
              </button>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="px-3 py-3 rounded-xl bg-slate-900/50 border border-dashed border-slate-800 text-center mb-2">
              <p className="text-xs text-slate-400 mb-2">No saved chats yet</p>
              <button
                type="button"
                onClick={() => {
                  onNewChat();
                  navigate('/');
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-300 text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Start New Chat</span>
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {sessions.map((sess) => {
                const isActive = sess.id === currentSessionId;
                return (
                  <div
                    key={sess.id}
                    className={`group relative flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-all ${
                      isActive
                        ? 'bg-slate-800/90 text-brand-300 font-medium border border-brand-500/20'
                        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectSession(sess.id);
                        navigate('/');
                        onClose();
                      }}
                      className="flex items-center gap-2 min-w-0 flex-1 text-left py-0.5"
                      title={sess.title}
                    >
                      <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-brand-400'}`} />
                      <span className="truncate flex-1">{sess.title}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteStoredSession(sess.id);
                        loadSessions();
                        if (sess.id === currentSessionId) {
                          onNewChat();
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all ml-1 flex-shrink-0"
                      title="Delete this chat"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Show All Recent Chats Button - Always Visible */}
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="w-full mt-2 py-2 px-2.5 rounded-lg text-xs font-medium text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 flex items-center justify-between transition-colors shadow-sm active:scale-[0.99]"
            title="View, search, and manage all previous conversations"
          >
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-semibold">Show All Recent Chats</span>
            </div>
            <span className="text-[10px] bg-brand-500/20 text-brand-300 font-mono font-bold px-1.5 py-0.5 rounded">
              {sessions.length}
            </span>
          </button>

          {/* Module Navigation Links */}
          <div className="mt-4 pt-3 border-t border-slate-800/70">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 block mb-2">
              Explore Tools
            </span>
            <nav className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 text-slate-400" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-surface-950/40 flex items-center gap-2">
          <img src="./logo.png" alt="NutritionAI Logo" className="w-5 h-5 rounded-full object-cover border border-emerald-500/30 flex-shrink-0" />
          <div className="flex-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Eat Smart · Live Well</span>
            <span className="text-emerald-400 font-semibold">SDG 2</span>
          </div>
        </div>
      </aside>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-semibold text-white">Clear All Conversations?</h3>
            </div>
            <p className="text-sm text-slate-300 mb-5 leading-relaxed">
              This will permanently delete all your saved chat sessions from this browser. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Recent Chats Modal */}
      <HistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => {
          onSelectSession(id);
          navigate('/');
          onClose();
        }}
        onNewChat={() => {
          onNewChat();
          navigate('/');
          onClose();
        }}
      />
    </>
  );
};
