/**
 * NutriZero AI - Automatic Speech Synthesis Service
 * Automatically speaks AI responses using browser window.speechSynthesis.
 * Adheres strictly to all requirements:
 * - Speaks ONLY AI responses (never user messages)
 * - Automatically triggered when AI response arrives
 * - Cancels previous speech before starting new speech
 * - Prevents duplicate speech with ID tracking
 * - Speech failure silently handled without breaking chat
 * - Clean stop on page navigation
 */

let lastSpokenMessageId: string | null = null;

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

export function speakAIResponse(messageId: string, text: string): void {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
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

    // Speak a clean, digestible portion (first 500 characters of key guidance)
    const speakPortion = cleanedText.length > 500 
      ? cleanedText.slice(0, 500) + '... Check the screen for full details.'
      : cleanedText;

    const utterance = new SpeechSynthesisUtterance(speakPortion);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    // Try to pick a natural, pleasant voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Premium'))
    ) || voices.find(v => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onerror = (e) => {
      // Speech errors (e.g. user navigation cancel) must never break chat
      console.warn('Speech synthesis event notice:', e.error);
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    // Silently continue text chat if speech synthesis encounters an environment issue
    console.warn('Automatic voice playback silently bypassed:', err);
  }
}
