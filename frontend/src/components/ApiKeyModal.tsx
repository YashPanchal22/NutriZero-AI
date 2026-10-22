import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle2, AlertCircle, ExternalLink, Sparkles, RefreshCw, Trash2 } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: (hasKey: boolean) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('nutrizero_gemini_api_key') || '';
      setApiKey(stored);
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setStatusMessage({ type: 'error', text: 'Please enter a Gemini API Key.' });
      return;
    }

    setIsTesting(true);
    setStatusMessage(null);

    try {
      // Test the key against Google Gemini API
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(trimmed)}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello, respond with: OK' }] }],
          generationConfig: { maxOutputTokens: 10 }
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData?.error?.message || `HTTP ${res.status}: Invalid API Key or Gemini API error.`;
        setStatusMessage({ type: 'error', text: msg });
        setIsTesting(false);
        return;
      }

      // Key is valid! Save it to localStorage
      localStorage.setItem('nutrizero_gemini_api_key', trimmed);
      window.dispatchEvent(new CustomEvent('nutrizero_api_key_updated', { detail: trimmed }));
      setStatusMessage({ type: 'success', text: 'API Key verified and saved! Live Google Gemini is now active.' });
      onKeySaved?.(true);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Network error while validating key. Please check your internet connection.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleRemoveKey = () => {
    localStorage.removeItem('nutrizero_gemini_api_key');
    setApiKey('');
    window.dispatchEvent(new CustomEvent('nutrizero_api_key_updated', { detail: null }));
    setStatusMessage({ type: 'success', text: 'API Key removed. Reverted to built-in offline demo mode.' });
    onKeySaved?.(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-surface-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-500/15 text-brand-400 border border-brand-500/30">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-white">Google Gemini API Key</h3>
            <p className="text-xs text-slate-400">Unlock dynamic, unlimited AI answers directly from Google</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-surface-950 rounded-xl p-3.5 border border-slate-800 text-xs text-slate-300 space-y-2">
          <p className="font-semibold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" /> How to get your 100% Free Gemini API Key:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-slate-400">
            <li>
              Go to{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-brand-400 hover:underline font-medium inline-flex items-center gap-0.5"
              >
                Google AI Studio <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>Sign in with your Google account.</li>
            <li>Click <strong>"Create API Key"</strong> and copy it.</li>
            <li>Paste your key below (it usually starts with <code className="text-emerald-400 font-mono">AIzaSy...</code>).</li>
          </ol>
        </div>

        {/* Input Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Your Google Gemini API Key:</label>
          <input
            type="password"
            placeholder="AIzaSy..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full bg-surface-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono tracking-wide"
          />
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/50 border border-emerald-800/60 text-emerald-300'
                : 'bg-rose-950/50 border border-rose-800/60 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          {apiKey ? (
            <button
              type="button"
              onClick={handleRemoveKey}
              className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Key</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isTesting}
              onClick={handleTestAndSave}
              className="px-5 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{isTesting ? 'Verifying...' : 'Save & Connect'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
