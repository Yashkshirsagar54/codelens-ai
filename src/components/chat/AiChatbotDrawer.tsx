import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  User,
  Copy,
  Check,
  RotateCcw,
  Minimize2,
  Maximize2,
  Terminal,
} from 'lucide-react';
import { sendChatMessage, ChatMessageItem } from '../../lib/apiClient';
import { CopilotLogo } from '../CopilotLogo';

interface AiChatbotDrawerProps {
  activeCode?: string;
  language?: string;
  getToken?: () => Promise<string | null>;
}

const INITIAL_MESSAGES: ChatMessageItem[] = [
  {
    role: 'assistant',
    content: `👋 **Hi! I'm CodeLens Copilot.**\n\nI'm your AI senior engineer and mentor. I can break down your code **line-by-line**, evaluate **Big-O complexity**, detect **security vulnerabilities**, and write **unit tests**.\n\n*Click any action chip below or ask me a question about your code!*`,
  },
];

const QUICK_PROMPTS = [
  { label: '🔍 Line-by-Line Breakdown', prompt: 'Provide a detailed line-by-line breakdown explaining what each line and block does.' },
  { label: '⏱️ Big-O Complexity', prompt: 'Calculate the exact asymptotic Big-O Time Complexity and Space Complexity with explanation.' },
  { label: '🛡️ Security Vulnerabilities', prompt: 'Audit this code for security vulnerabilities, injection risks, and auth flaws.' },
  { label: '⚡ Optimize Performance', prompt: 'How can I optimize the runtime performance and memory footprint of this code?' },
  { label: '🧪 Generate Unit Tests', prompt: 'Generate a comprehensive unit test suite covering happy paths and edge cases.' },
  { label: '✨ Refactor & Clean Code', prompt: 'Refactor this snippet using clean code principles and solid design patterns.' },
];

export const AiChatbotDrawer: React.FC<AiChatbotDrawerProps> = ({
  activeCode,
  language,
  getToken,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [includeCodeContext, setIncludeCodeContext] = useState<boolean>(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend || loading) return;

    const userMessage: ChatMessageItem = { role: 'user', content: textToSend };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    if (!customPrompt) setInput('');
    setLoading(true);

    try {
      const codeToSend = includeCodeContext && activeCode ? activeCode : undefined;
      const response = await sendChatMessage(
        updatedMessages,
        codeToSend,
        language || 'auto',
        getToken
      );

      setMessages([...updatedMessages, response.message]);
    } catch (err: any) {
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: `⚠️ **Error:** ${err.message || 'Failed to generate response. Please try again.'}`,
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
  };

  // Render message content with code block detection and table formatting
  const renderMessageContent = (content: string, msgIndex: number) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return (
      <div className="space-y-2 text-xs leading-relaxed">
        {parts.map((part, pIdx) => {
          if (part.startsWith('```') && part.endsWith('```')) {
            const lines = part.slice(3, -3).trim().split('\n');
            const codeLang = lines[0]?.match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : '';
            const codeBody = codeLang ? lines.slice(1).join('\n') : lines.join('\n');

            return (
              <div key={pIdx} className="my-2 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 font-mono text-[11px] shadow-inner">
                <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400">
                  <span className="text-[10px] uppercase font-semibold text-emerald-400 font-mono">{codeLang || 'code'}</span>
                  <button
                    onClick={() => handleCopy(codeBody, msgIndex * 100 + pIdx)}
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {copiedIndex === msgIndex * 100 + pIdx ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedIndex === msgIndex * 100 + pIdx ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 overflow-x-auto text-emerald-300">
                  <code>{codeBody}</code>
                </pre>
              </div>
            );
          }

          return (
            <div key={pIdx} className="whitespace-pre-wrap">
              {part}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Slide-out Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/90 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-xl ${
            isExpanded
              ? 'inset-4 sm:inset-10'
              : 'bottom-4 right-4 w-[95vw] sm:w-[460px] h-[600px] max-h-[90vh]'
          }`}
        >
          {/* Top Header */}
          <div className="px-4 py-3.5 bg-slate-50 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CopilotLogo size="sm" animated={false} />
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>CodeLens Copilot</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">AI Senior Architect &amp; Mentor</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Clear Conversation"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Restore Size' : 'Expand View'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors hidden sm:block cursor-pointer"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                title="Close Copilot"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Context Banner */}
          {activeCode && (
            <div className="px-4 py-1.5 bg-slate-100 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 truncate">
                <Terminal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">Active: {language || 'Auto'} ({activeCode.split('\n').length} lines)</span>
              </div>
              <label className="flex items-center gap-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none shrink-0 ml-2">
                <input
                  type="checkbox"
                  checked={includeCodeContext}
                  onChange={(e) => setIncludeCodeContext(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-0"
                />
                <span>Attach</span>
              </label>
            </div>
          )}

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/40 font-sans">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      isUser
                        ? 'bg-[#159C63] text-white shadow-xs'
                        : 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-xs p-1'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <CopilotLogo size="sm" animated={false} />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs ${
                      isUser
                        ? 'bg-[#159C63] text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {renderMessageContent(msg.content, idx)}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0 p-1">
                  <CopilotLogo size="sm" animated={true} />
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs shadow-xs">
                  <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
                  <span>Analyzing code &amp; generating explanation...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp.prompt)}
                disabled={loading}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-[10px] font-medium transition-colors whitespace-nowrap shrink-0 disabled:opacity-40 cursor-pointer shadow-xs"
              >
                <span>{qp.label}</span>
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                includeCodeContext && activeCode
                  ? 'Ask Copilot to explain or analyze your code...'
                  : 'Ask any programming or architecture question...'
              }
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:border-[#159C63] transition-colors"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-[#159C63] to-teal-600 hover:opacity-90 disabled:opacity-40 text-white shadow-md shadow-emerald-500/25 transition-all shrink-0 cursor-pointer"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
