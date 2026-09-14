import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, Bot, Sparkles, User, RotateCcw, 
  ChevronDown, HelpCircle, ShieldCheck, MapPin, AlertCircle 
} from 'lucide-react';
import { AIChatMessage } from '../../core/types';
import { MASCOT_CONFIG } from '../../core/mascot';
import { aiService } from '../../shared/services/ai';
import { sound } from '../../shared/services/sound';
import { AI_STORAGE_KEYS } from '../../core/ai-config';

interface RobotChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export const RobotChatModal: React.FC<RobotChatModalProps> = ({ 
  isOpen, 
  onClose, 
  initialPrompt 
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize messages and handle initialPrompt
  useEffect(() => {
    const rawHistory = localStorage.getItem(AI_STORAGE_KEYS.CHAT_HISTORY);
    const key = localStorage.getItem(AI_STORAGE_KEYS.API_KEY);
    setHasApiKey(!!key && key.trim().length > 0);

    if (rawHistory) {
      try {
        setMessages(JSON.parse(rawHistory));
      } catch {
        initDefaultGreeting();
      }
    } else {
      initDefaultGreeting();
    }
  }, []);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const initDefaultGreeting = () => {
    const defaultMsg: AIChatMessage = {
      id: 'msg_welcome',
      sender: 'bot',
      text: MASCOT_CONFIG.welcomeGreeting,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      is_fallback: true,
    };
    setMessages([defaultMsg]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputText).trim();
    if (!prompt || isLoading) return;

    sound.playClick();
    setInputText('');

    const userMsg: AIChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const response = await aiService.sendMessage(prompt, newHistory);
      sound.playCorrect();

      const botMsg: AIChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'bot',
        text: response.text,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        is_fallback: response.isFallback,
      };

      const updatedHistory = [...newHistory, botMsg];
      setMessages(updatedHistory);
      localStorage.setItem(AI_STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(updatedHistory.slice(-20)));
    } catch {
      sound.playWrong();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    sound.playClick();
    localStorage.removeItem(AI_STORAGE_KEYS.CHAT_HISTORY);
    initDefaultGreeting();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md h-[88vh] bg-[#0c1322]/95 backdrop-blur-2xl rounded-[28px] border border-blue-500/30 shadow-2xl flex flex-col overflow-hidden relative">
        {/* Chat Frosted Header */}
        <div className="p-3.5 bg-[#080e1e]/90 border-b border-white/10 flex items-center justify-between backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0066cc] via-indigo-600 to-amber-500 p-0.5 shadow-md">
              <div className="w-full h-full bg-[#060b18] rounded-[14px] p-0.5 flex items-center justify-center overflow-hidden">
                <img
                  src={MASCOT_CONFIG.avatarUrl}
                  alt={MASCOT_CONFIG.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src.endsWith('.png')) {
                      target.src = MASCOT_CONFIG.fallbackAvatarUrl;
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-heading font-bold text-white tracking-apple-tight">
                  {MASCOT_CONFIG.name}
                </h3>
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {hasApiKey ? 'Gemini AI' : 'Rule-Based Engine'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {MASCOT_CONFIG.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearHistory}
              className="p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors btn-press"
              title="Bersihkan Percakapan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors btn-press"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs no-scrollbar">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isBot ? 'items-start' : 'items-end justify-end'}`}
              >
                {isBot && (
                  <div className="w-7 h-7 rounded-xl bg-slate-900 border border-white/10 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={MASCOT_CONFIG.avatarUrl}
                      alt={MASCOT_CONFIG.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src.endsWith('.png')) {
                          target.src = MASCOT_CONFIG.fallbackAvatarUrl;
                        }
                      }}
                    />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-[18px] p-3.5 leading-relaxed shadow-md ${
                    isBot
                      ? 'bg-[#151f38]/90 border border-white/10 text-slate-200 rounded-tl-sm'
                      : 'bg-[#0066cc] text-white rounded-br-sm font-medium shadow-blue-900/30'
                  }`}
                >
                  <div className="whitespace-pre-line prose prose-invert prose-xs">
                    {msg.text}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1.5 pt-1.5 text-[9px] text-slate-400 border-t border-white/10">
                    <span>{msg.timestamp}</span>
                    {isBot && (
                      <span className="text-blue-300 font-medium">
                        {msg.is_fallback ? '⚡ Respon Cepat' : '✨ Gemini Pro'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-blue-300 text-xs italic p-2.5 bg-blue-950/40 rounded-2xl border border-blue-500/30 w-fit">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-blue-400" />
              <span>Si SIGAP sedang menganalisis data lalu lintas Banyuwangi...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips Bar */}
        <div className="px-3.5 py-2 bg-[#080e1e]/80 border-t border-white/10 overflow-x-auto no-scrollbar flex gap-1.5 shrink-0">
          {MASCOT_CONFIG.quickSuggestions.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip.prompt)}
              className="text-[10px] font-semibold px-3 py-1.5 rounded-full bg-white/5 border border-blue-500/25 text-blue-300 hover:bg-white/10 whitespace-nowrap transition-all btn-press flex items-center gap-1 shrink-0"
            >
              <span>{chip.label}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-[#080e1e] border-t border-white/10 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            placeholder="Tanya seputar rute, kemacetan, pasal SIM..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-full bg-[#151f38]/90 border border-white/10 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0066cc] min-h-[44px]"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="w-11 h-11 rounded-full bg-[#0066cc] hover:bg-[#0071e3] disabled:opacity-40 text-white shadow-md transition-all flex items-center justify-center shrink-0 btn-press"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
