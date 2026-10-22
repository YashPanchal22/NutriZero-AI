import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  RefreshCw,
  Bot,
  User,
  CornerDownLeft,
  Volume2,
  AlertCircle,
  Mic,
  MicOff,
  Camera,
  X,
  Paperclip
} from 'lucide-react';
import { ChatMessage, ConversationSession } from '../types';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { apiClient } from '../api/client';
import { speakAIResponse, stopSpeech } from '../services/voice';
import {
  getStoredSessions,
  saveSessions,
  cleanTitleFromPrompt,
  incrementActivityStat,
} from '../services/storage';

interface ChatPageProps {
  currentSessionId: string | null;
  onSessionUpdated: (id: string) => void;
}

const WELCOME_TEXT = "Hi! 👋 I'm NutriZero AI. I can help you plan affordable meals, understand nutrition, reduce food waste, and create recipes from your ingredients or food photos. You can type, speak with the mic 🎙️, or upload a food photo 📷!";

const SUGGESTIONS = [
  "Create a healthy meal under ₹100",
  "I have rice and dal. What can I cook?",
  "Give me affordable protein sources",
  "How can I reduce food waste?",
  "Give me a leftover rice recipe",
  "Explain SDG 2",
];

export const ChatPage: React.FC<ChatPageProps> = ({ currentSessionId, onSessionUpdated }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // Voice Speech-to-Text State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Photo Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load session or initialize fresh session
  useEffect(() => {
    const sessions = getStoredSessions();
    if (currentSessionId) {
      const found = sessions.find(s => s.id === currentSessionId);
      if (found && Array.isArray(found.messages) && found.messages.length > 0) {
        setMessages(found.messages);
        return;
      }
    }

    // Default welcome message for brand new session
    const initialWelcome: ChatMessage = {
      id: 'welcome-msg',
      role: 'assistant',
      content: WELCOME_TEXT,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([initialWelcome]);
  }, [currentSessionId]);

  // Clean up voice and speech recognition when component unmounts
  useEffect(() => {
    return () => {
      stopSpeech();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Speech-to-Text Recognition Handlers
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.');
      return;
    }

    try {
      stopSpeech(); // Stop any bot speech while user speaks
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setInputText((prev) => (prev ? prev + ' ' + transcript : transcript));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition start error:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  const toggleSpeechRecognition = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Photo Selection Handlers
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image exceeds 10MB limit. Please upload a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setSelectedImageName(file.name);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setSelectedImageName(null);
  };

  const persistMessages = (newMessages: ChatMessage[]) => {
    const sessions = getStoredSessions();
    let sessionId = currentSessionId;

    // Filter out initial welcome from title generation check
    const userFirstMsg = newMessages.find(m => m.role === 'user');

    if (!sessionId) {
      sessionId = 'session_' + Date.now();
      const newSession: ConversationSession = {
        id: sessionId,
        title: userFirstMsg ? cleanTitleFromPrompt(userFirstMsg.content) : 'New Conversation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: newMessages,
      };
      sessions.unshift(newSession);
      saveSessions(sessions);
      onSessionUpdated(sessionId);
      incrementActivityStat('conversationsCount');
    } else {
      const idx = sessions.findIndex(s => s.id === sessionId);
      if (idx !== -1) {
        sessions[idx].messages = newMessages;
        sessions[idx].updatedAt = new Date().toISOString();
        if (sessions[idx].title === 'New Conversation' && userFirstMsg) {
          sessions[idx].title = cleanTitleFromPrompt(userFirstMsg.content);
        }
        saveSessions(sessions);
      } else {
        // Handle unpersisted session ID (e.g. from New Conversation action)
        const newSession: ConversationSession = {
          id: sessionId,
          title: userFirstMsg ? cleanTitleFromPrompt(userFirstMsg.content) : 'New Conversation',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: newMessages,
        };
        sessions.unshift(newSession);
        saveSessions(sessions);
        onSessionUpdated(sessionId);
        incrementActivityStat('conversationsCount');
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    const imageToSend = selectedImage;
    if ((!query && !imageToSend) || isLoading) return;

    const effectiveQuery =
      query ||
      'Please analyze this food photo and create a delicious, budget-friendly recipe with ingredients, cooking steps, estimated cost in ₹, and nutrition info.';

    // Stop ongoing speech & listening
    stopSpeech();
    stopListening();
    setLastError(null);
    setInputText('');
    setSelectedImage(null);
    setSelectedImageName(null);

    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: effectiveQuery,
      imageUrl: imageToSend || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    // Persist immediately so Recent Chats updates with query in real-time
    persistMessages(updatedMessages);
    setIsLoading(true);

    try {
      let res;
      if (imageToSend) {
        // Multimodal Vision Recipe Call
        res = await apiClient.post('/api/recipe-from-image', {
          image: imageToSend,
          prompt: effectiveQuery,
        });
        incrementActivityStat('recipesCount');
      } else {
        // Build history for backend
        const historyPayload = updatedMessages
          .filter(m => m.id !== 'welcome-msg' && !m.isError)
          .slice(-6)
          .map(m => ({
            role: m.role,
            content: m.content,
          }));

        res = await apiClient.post('/api/chat', {
          message: effectiveQuery,
          history: historyPayload,
        });
      }

      const replyText =
        res.data?.reply ||
        'I received your request. How else can I assist with your meal planning or recipes?';
      const followUps = res.data?.followUps || [];

      const aiMsg: ChatMessage = {
        id: 'ai_' + Date.now(),
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        followUps: followUps,
      };

      const finalMessages = [...updatedMessages, aiMsg];
      setMessages(finalMessages);
      persistMessages(finalMessages);

      // AUTOMATIC VOICE: Speak the AI answer automatically
      speakAIResponse(aiMsg.id, replyText);
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackText =
        'Gemini AI is currently unavailable. Please check the API configuration and try again.';
      setLastError(fallbackText);

      const errorAiMsg: ChatMessage = {
        id: 'ai_err_' + Date.now(),
        role: 'assistant',
        content: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };

      const finalMessages = [...updatedMessages, errorAiMsg];
      setMessages(finalMessages);
      persistMessages(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    // Find the last user message
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (lastUser) {
      handleSendMessage(lastUser.content);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] bg-surface-950 overflow-hidden">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-5">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Top Brand Logo Hero for Fresh Chat */}
          {messages.length <= 1 && (
            <div className="text-center py-4 sm:py-6 px-4 mb-2 animate-fadeIn">
              <div className="w-20 h-20 mx-auto mb-3 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-xl shadow-emerald-500/20 bg-surface-900 p-1 group">
                <img
                  src="./logo.png"
                  alt="NutritionAI Logo"
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform"
                />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white flex items-center justify-center gap-2 mb-1">
                Nutrition<span className="text-emerald-400">AI</span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30 uppercase tracking-wider">
                  Eat Smart · Live Well
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                Affordable nutrition, budget meal plans, leftover recipes & zero hunger awareness.
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const isAI = msg.role === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {/* AI Avatar */}
                {isAI && (
                  <div className="w-8 h-8 rounded-xl overflow-hidden border border-emerald-500/40 flex-shrink-0 flex items-center justify-center mt-1 shadow-md shadow-emerald-500/20 bg-surface-900">
                    <img
                      src="./logo.png"
                      alt="NutritionAI"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Message Bubble Card */}
                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 shadow-lg ${
                    isAI
                      ? msg.isError
                        ? 'bg-rose-950/40 border border-rose-800/60 text-rose-200'
                        : 'bg-surface-900 border border-slate-800 text-slate-100'
                      : 'bg-gradient-to-r from-brand-600 to-emerald-600 text-white rounded-br-none'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-white/5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {isAI ? 'NutritionAI' : 'You'}
                    </span>
                    <div className="flex items-center gap-2">
                      {isAI && !msg.isError && (
                        <button
                          type="button"
                          onClick={() => speakAIResponse(msg.id + '_replay', msg.content)}
                          className="text-slate-400 hover:text-brand-400 p-1 rounded transition-colors"
                          title="Read aloud again"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                    </div>
                  </div>

                  {/* Attached Image Thumbnail */}
                  {msg.imageUrl && (
                    <div className="mb-2.5 rounded-xl overflow-hidden border border-white/20 bg-black/30 max-w-sm">
                      <img
                        src={msg.imageUrl}
                        alt="Uploaded food photo"
                        className="w-full max-h-60 object-cover"
                      />
                      <div className="p-1.5 bg-black/40 text-[11px] text-slate-300 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-brand-300" />
                        <span>Food Photo Recipe Request</span>
                      </div>
                    </div>
                  )}

                  {/* Message Content */}
                  {isAI ? (
                    <MarkdownRenderer content={msg.content} />
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                  )}

                  {/* Follow-Up Suggestions */}
                  {isAI && msg.followUps && msg.followUps.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80">
                      <span className="text-xs font-semibold text-emerald-400 block mb-2">
                        Suggested Follow-Ups:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.followUps.map((q, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessage(q)}
                            className="text-xs bg-slate-800/80 hover:bg-brand-500/20 text-slate-200 hover:text-brand-300 px-3 py-1.5 rounded-lg border border-slate-700/60 transition-colors text-left active:scale-[0.98]"
                          >
                            👉 {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error State with Retry Button */}
                  {msg.isError && (
                    <div className="mt-3 pt-2 border-t border-rose-800/40 flex items-center justify-between">
                      <span className="text-xs text-rose-300 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" /> Failed to reach Gemini AI
                      </span>
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="px-3 py-1 bg-rose-800/60 hover:bg-rose-700 text-white rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" /> Retry
                      </button>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {!isAI && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex-shrink-0 flex items-center justify-center mt-1">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 sm:gap-4 justify-start">
              <div className="w-8 h-8 rounded-xl overflow-hidden border border-emerald-500/40 flex-shrink-0 flex items-center justify-center shadow-md shadow-emerald-500/20 bg-surface-900">
                <img src="./logo.png" alt="NutritionAI" className="w-full h-full object-cover animate-pulse" />
              </div>
              <div className="bg-surface-900 border border-slate-800 rounded-2xl px-5 py-4 flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" />
                <span className="text-xs text-slate-400 ml-2">NutritionAI is preparing your answer...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Quick Questions */}
      {messages.length <= 1 && (
        <div className="px-4 py-2 border-t border-slate-800/60 bg-surface-900/40">
          <div className="max-w-3xl mx-auto">
            <span className="text-xs font-semibold text-slate-400 block mb-2">
              💡 Quick questions to ask:
            </span>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(s)}
                  className="text-xs bg-slate-900/90 hover:bg-brand-500/10 hover:border-brand-500/40 hover:text-brand-300 text-slate-300 px-3 py-1.5 rounded-full border border-slate-800 transition-colors shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="p-3 sm:p-4 border-t border-slate-800 bg-surface-900/90 backdrop-blur-md">
        <div className="max-w-3xl mx-auto">
          {/* Selected Image Preview Dock */}
          {selectedImage && (
            <div className="mb-2.5 p-2.5 bg-surface-950 border border-brand-500/40 rounded-2xl flex items-center justify-between gap-3 shadow-lg animate-fadeIn">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={selectedImage}
                  alt="Food to analyze"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-brand-300 truncate flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{selectedImageName || 'Food Photo Selected'}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Ready to analyze & create a recipe! Press Send or type instructions.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors flex-shrink-0"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Voice Listening Active Indicator */}
          {isListening && (
            <div className="mb-2.5 px-3 py-2 bg-rose-950/50 border border-rose-500/40 rounded-xl flex items-center justify-between gap-2 text-xs text-rose-300 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-semibold">Listening to your voice... Speak now</span>
              </div>
              <button
                type="button"
                onClick={stopListening}
                className="px-2 py-0.5 rounded bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-[11px] font-medium transition-colors"
              >
                Stop
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-1.5 sm:gap-2 bg-surface-950 border border-slate-800 focus-within:border-brand-500/60 rounded-2xl p-2 shadow-xl transition-colors"
          >
            {/* Hidden Photo File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Photo / Camera Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="p-2.5 rounded-xl text-slate-400 hover:text-brand-400 hover:bg-slate-800/80 transition-all flex-shrink-0 active:scale-95"
              title="Upload photo of food or ingredients to generate recipe"
            >
              <Camera className="w-5 h-5" />
            </button>

            {/* Voice Input Microphone Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              disabled={isLoading}
              className={`p-2.5 rounded-xl transition-all flex-shrink-0 active:scale-95 ${
                isListening
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse shadow-md shadow-rose-500/20'
                  : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80'
              }`}
              title={isListening ? 'Stop voice recording' : 'Voice Input: Speak your question'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Textarea Input */}
            <textarea
              ref={inputRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                isListening
                  ? 'Listening to speech...'
                  : selectedImage
                  ? 'Add instructions (e.g. make this recipe under ₹100), or press Send...'
                  : 'Ask about meals, ingredients, speak with mic 🎙️, or upload photo 📷...'
              }
              className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 px-2 py-2 outline-none resize-none max-h-32 leading-relaxed"
              disabled={isLoading}
            />

            {/* Submit / Send Button */}
            <button
              type="submit"
              disabled={isLoading || (!inputText.trim() && !selectedImage)}
              className="p-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md shadow-brand-500/20 transition-all flex-shrink-0 active:scale-95"
              title={selectedImage ? 'Generate Recipe from Photo' : 'Send Message'}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 mt-2">
            <span>🎙️ Voice typing · 📷 Photo recipe generator · 🔊 Audio read-aloud active</span>
            <span className="hidden sm:inline">Press Enter ↵ to send</span>
          </div>
        </div>
      </div>
    </div>
  );
};
