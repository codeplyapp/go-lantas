import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, RotateCcw 
} from 'lucide-react';
import { AIService, AIChatMessage } from '../../core/types';
import { MASCOT_CONFIG } from '../../core/mascot';
import { aiService } from '../../shared/services/ai';
import { sound } from '../../shared/services/sound';
import { AI_STORAGE_KEYS, isGeminiConfigured } from '../../core/ai-config';
import { MarkdownRenderer } from '../../shared/components/MarkdownRenderer';

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

  const [isRendered, setIsRendered] = useState<boolean>(isOpen);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle open/close animation lifecycle
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
    } else if (isRendered) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 260);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (isClosing) return;
    sound.playClick();
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 250);
  };

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isClosing) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isClosing]);

  // Initialize messages and handle initialPrompt
  useEffect(() => {
    const rawHistory = localStorage.getItem(AI_STORAGE_KEYS.CHAT_HISTORY);
    setHasApiKey(isGeminiConfigured());

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

  if (!isRendered) return null;

  return (
    <div 
      onClick={handleClose}
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-sm ${
        isClosing ? 'animate-chat-backdrop-exit' : 'animate-chat-backdrop-enter'
      }`}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md h-[88vh] bg-white rounded-[24px] border border-slate-200 shadow-2xl flex flex-col overflow-hidden relative ${
          isClosing ? 'animate-chat-modal-exit' : 'animate-chat-modal-enter'
        }`}
      >
        {/* Chat Frosted Header */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 shrink-0 flex items-center justify-center drop-shadow-xs animate-mascot-hello">
              <img
                src={MASCOT_CONFIG.avatarUrl}
                alt={MASCOT_CONFIG.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.endsWith('.svg')) {
                    target.src = MASCOT_CONFIG.fallbackAvatarUrl;
                  }
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-heading font-extrabold text-[#0F172A] tracking-apple-tight">
                  {MASCOT_CONFIG.name}
                </h3>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  Online
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                {MASCOT_CONFIG.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearHistory}
              className="p-2 rounded-full text-slate-500 hover:text-[#0077c0] hover:bg-slate-200 transition-colors btn-press"
              title="Bersihkan Percakapan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleClose}
              className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors btn-press"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs no-scrollbar bg-[#FAFAFA]">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isBot ? 'items-start' : 'items-end justify-end'}`}
              >
                {isBot && (
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center drop-shadow-2xs">
                    <img
                      src={MASCOT_CONFIG.avatarUrl}
                      alt={MASCOT_CONFIG.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src.endsWith('.svg')) {
                          target.src = MASCOT_CONFIG.fallbackAvatarUrl;
                        }
                      }}
                    />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-[16px] p-3.5 leading-relaxed shadow-xs ${
                    isBot
                      ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm font-medium'
                      : 'bg-[#0077c0] text-white rounded-br-sm font-medium shadow-sm'
                  }`}
                >
                  <MarkdownRenderer content={msg.text} isBot={isBot} />
                  <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 text-[9px] text-slate-400 border-t border-slate-100/80">
                    <span>{msg.timestamp}</span>
                    {isBot && (
                      <span className="text-[#0077c0] font-bold">
                        {msg.is_fallback ? '⚡ Respon Cepat' : '✨ Gemini 3.6 Flash'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 items-start animate-fadeIn">
              <div className="w-8 h-8 shrink-0 flex items-center justify-center drop-shadow-2xs">
                <img
                  src={MASCOT_CONFIG.avatarUrl}
                  alt={MASCOT_CONFIG.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src.endsWith('.svg')) {
                      target.src = MASCOT_CONFIG.fallbackAvatarUrl;
                    }
                  }}
                />
              </div>

              <div className="bg-white border border-slate-200 rounded-[16px] rounded-tl-sm px-4 py-3 shadow-xs flex items-center gap-1.5 w-fit">
                <span className="w-2 h-2 rounded-full bg-[#0077c0] typing-dot-1" />
                <span className="w-2 h-2 rounded-full bg-[#0077c0] typing-dot-2" />
                <span className="w-2 h-2 rounded-full bg-[#0077c0] typing-dot-3" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips Bar */}
        <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-200 overflow-x-auto no-scrollbar flex gap-1.5 shrink-0">
          {MASCOT_CONFIG.quickSuggestions.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip.prompt)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#0077c0] hover:border-[#0077c0]/40 whitespace-nowrap transition-all btn-press flex items-center gap-1 shrink-0 shadow-2xs"
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
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            placeholder="Tanya seputar rute, kemacetan, pasal SIM..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-full bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0077c0] min-h-[44px]"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="w-11 h-11 rounded-full bg-[#0077c0] hover:bg-[#008be0] disabled:opacity-40 text-white shadow-sm transition-all flex items-center justify-center shrink-0 btn-press"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
