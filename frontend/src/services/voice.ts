/**
 * NutriZero AI - Automatic Speech Synthesis Service
 * Provides speech synthesis with full mute/unmute control.
 * Default is MUTED to prevent unwanted sound playback.
 */

const MUTE_STORAGE_KEY = 'nutrizero_voice_muted';
let lastSpokenMessageId: string | null = null;

export function isVoiceMuted(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(MUTE_STORAGE_KEY);
  // Default to muted (true) for comfortable browsing unless user explicitly unmuted
  if (stored === null) {
    return true;
  }
  return stored === 'true';
}

export function setVoiceMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, muted ? 'true' : 'false');
    if (muted) {
      stopSpeech();
    }
    window.dispatchEvent(new CustomEvent('nutrizero_voice_mute_changed', { detail: muted }));
  } catch (err) {
    console.warn('Failed to update voice mute setting', err);
  }
}

export function toggleVoiceMute(): boolean {
  const next = !isVoiceMuted();
  setVoiceMuted(next);
  return next;
}

function cleanMarkdownForSpeech(text: string): string {
  if (!text) return '';
  return text
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove markdown headers
    .replace(/#{1,6}\s+/g, '')
    // Remove bold/italics
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
    // Remove table lines and pipes
    .replace(/\|/g, ', ')
    .replace(/[-]{3,}/g, '')
    // Remove bullet points / numbering
    .replace(/^\s*[-*•\d.]+\s+/gm, '')
    // Remove URLs
    .replace(/https?:\/\/\S+/g, '')
    // Clean excessive whitespaces & newlines
    .replace(/\n+/g, '. ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function stopSpeech(): void {
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch (err) {
    // Non-breaking fallback
  }
}

export function speakAIResponse(messageId: string, text: string, forcePlay: boolean = false): void {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    // If muted and not explicitly forced, do not speak
    if (isVoiceMuted() && !forcePlay) {
      stopSpeech();
      return;
    }

    // Never speak duplicates
    if (lastSpokenMessageId === messageId) {
      return;
    }

    // Cancel any currently playing speech to prevent overlap
    stopSpeech();
    lastSpokenMessageId = messageId;

    const cleanedText = cleanMarkdownForSpeech(text);
    if (!cleanedText) return;

    // Speak a clean, digestible portion (first 400 characters)
    const speakPortion = cleanedText.length > 400 
      ? cleanedText.slice(0, 400) + '... Check your screen for complete instructions.'
      : cleanedText;

    const utterance = new SpeechSynthesisUtterance(speakPortion);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Premium'))
    ) || voices.find(v => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onerror = (e) => {
      console.warn('Speech synthesis event notice:', e.error);
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis silently bypassed:', err);
  }
}
