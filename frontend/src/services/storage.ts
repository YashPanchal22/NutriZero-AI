import { ConversationSession, AppActivityStats } from '../types';

const PRIMARY_SESSIONS_KEY = 'nutrizero_chat_sessions_v2';
const LEGACY_SESSIONS_KEYS = ['nutrizero_chat_sessions', 'nutrition_chat_sessions'];
const CURRENT_SESSION_ID_KEY = 'nutrizero_current_session_id';
const LEGACY_ACTIVE_ID_KEY = 'nutrizero_active_session_id';
const STATS_KEY = 'nutrizero_activity_stats_v2';

export function getStoredSessions(): ConversationSession[] {
  try {
    const keysToCheck = [PRIMARY_SESSIONS_KEY, ...LEGACY_SESSIONS_KEYS];
    const sessionMap = new Map<string, ConversationSession>();

    for (const key of keysToCheck) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            for (const item of parsed) {
              if (item && item.id && !sessionMap.has(item.id)) {
                sessionMap.set(item.id, {
                  id: String(item.id),
                  title: String(item.title || 'Conversation'),
                  createdAt: item.createdAt || new Date().toISOString(),
                  updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
                  messages: Array.isArray(item.messages) ? item.messages : [],
                });
              }
            }
          }
        } catch {
          // ignore corrupted keys
        }
      }
    }

    const sessions = Array.from(sessionMap.values());
    // Sort descending by most recently updated
    sessions.sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt).getTime();
      return timeB - timeA;
    });

    return sessions;
  } catch {
    return [];
  }
}

export function saveSessions(sessions: ConversationSession[]): void {
  try {
    const serialized = JSON.stringify(sessions);
    localStorage.setItem(PRIMARY_SESSIONS_KEY, serialized);
    // Mirror to legacy key so public/app.js stays in sync
    localStorage.setItem(LEGACY_SESSIONS_KEYS[0], serialized);
    // Notify all components in the window immediately
    window.dispatchEvent(new CustomEvent('nutrizero_sessions_updated', { detail: sessions }));
  } catch (err) {
    console.error('Failed to save sessions to localStorage', err);
  }
}

export function getCurrentSessionId(): string | null {
  return localStorage.getItem(CURRENT_SESSION_ID_KEY) || localStorage.getItem(LEGACY_ACTIVE_ID_KEY);
}

export function setCurrentSessionId(id: string): void {
  localStorage.setItem(CURRENT_SESSION_ID_KEY, id);
  localStorage.setItem(LEGACY_ACTIVE_ID_KEY, id);
  window.dispatchEvent(new CustomEvent('nutrizero_session_id_changed', { detail: id }));
}

export function deleteStoredSession(id: string): void {
  const sessions = getStoredSessions().filter(s => s.id !== id);
  saveSessions(sessions);
  if (getCurrentSessionId() === id) {
    if (sessions.length > 0) {
      setCurrentSessionId(sessions[0].id);
    } else {
      localStorage.removeItem(CURRENT_SESSION_ID_KEY);
      localStorage.removeItem(LEGACY_ACTIVE_ID_KEY);
      window.dispatchEvent(new CustomEvent('nutrizero_session_id_changed', { detail: null }));
    }
  }
}

export function clearAllStoredSessions(): void {
  localStorage.removeItem(PRIMARY_SESSIONS_KEY);
  for (const k of LEGACY_SESSIONS_KEYS) {
    localStorage.removeItem(k);
  }
  localStorage.removeItem(CURRENT_SESSION_ID_KEY);
  localStorage.removeItem(LEGACY_ACTIVE_ID_KEY);
  window.dispatchEvent(new CustomEvent('nutrizero_sessions_updated', { detail: [] }));
  window.dispatchEvent(new CustomEvent('nutrizero_session_id_changed', { detail: null }));
}

export function cleanTitleFromPrompt(prompt: string): string {
  if (!prompt) return 'New Conversation';
  let clean = prompt.trim().replace(/^["']|["']$/g, '');
  // Remove common filler words at the start
  clean = clean.replace(/^(can you|please|give me|how to|what is|tell me about|make me a|create a)\s+/i, '');
  // Capitalize words
  clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  if (clean.length > 28) {
    clean = clean.slice(0, 25) + '...';
  }
  return clean || 'Nutrition Chat';
}

// Activity Stats for Dashboard
export function getActivityStats(): AppActivityStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) {
      return {
        conversationsCount: 1,
        recipesCount: 0,
        mealPlansCount: 0,
        wasteHacksCount: 0,
        groceryPlansCount: 0,
        lastActive: new Date().toISOString()
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      conversationsCount: 1,
      recipesCount: 0,
      mealPlansCount: 0,
      wasteHacksCount: 0,
      groceryPlansCount: 0,
      lastActive: new Date().toISOString()
    };
  }
}

export function incrementActivityStat(key: keyof Omit<AppActivityStats, 'lastActive'>): void {
  try {
    const current = getActivityStats();
    current[key] = (current[key] || 0) + 1;
    current.lastActive = new Date().toISOString();
    localStorage.setItem(STATS_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn('Failed to update stats', err);
  }
}
