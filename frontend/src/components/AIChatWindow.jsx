import { X, Sparkles, User, Bot, Send, Loader2, Copy, Check, ThumbsUp, ThumbsDown, Clock, MessageSquare, Zap } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function AIChatWindow({ open, setOpen }) {
  const { token: contextToken, user } = useAuth();
  
  // Get token from localStorage based on current route (more reliable)
  const getToken = () => {
    const currentPath = window.location.pathname;
    const isAdminRoute = currentPath.startsWith('/admin') || currentPath === '/admin-login';
    return isAdminRoute 
      ? localStorage.getItem('admin_token')
      : localStorage.getItem('token');
  };
  
  const token = contextToken || getToken(); // Use context token if available, otherwise read from localStorage
  const [messages, setMessages] = useState([
    { 
      sender: "bot", 
      text: "Hello! I'm FaceCraft AI 👋\n\nI help with:\n• Face shapes\n• Hairstyle recommendations\n• Grooming tips\n\nHow can I assist you?",
      timestamp: new Date(),
      id: Date.now()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [feedback, setFeedback] = useState({});
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Quick suggestions
  const quickSuggestions = [
    "What face shapes exist?",
    "Best hairstyle for oval face",
    "Grooming tips"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleFeedback = (messageId, type) => {
    setFeedback(prev => ({ ...prev, [messageId]: type }));
  };

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const msgDate = new Date(date);
    const diff = now - msgDate;
    
    if (diff < 60000) return 'Now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const sendMessage = async (quickText = null) => {
    const messageText = quickText || input.trim();
    if (!messageText || isTyping) return;

    const userMessage = { 
      sender: "user", 
      text: messageText,
      timestamp: new Date(),
      id: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    if (!quickText) setInput("");
    setIsTyping(true);

    const updatedHistory = [
      ...conversationHistory,
      { role: 'user', text: messageText }
    ];
    setConversationHistory(updatedHistory);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const headers = {
        "Content-Type": "application/json",
      };
      
      // Add auth token if user is logged in
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        console.log('🔐 Sending token with chatbot request');
      } else {
        console.log('⚠️ No token available - sending as anonymous');
      }
      
      console.log('📤 Chatbot request:', {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        message: messageText.substring(0, 30) + '...'
      });
      
      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ 
          message: messageText,
          conversationHistory: updatedHistory.slice(-5),
          conversationId: conversationId
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to get response');
      }

      const data = await res.json();

      if (data.success && data.reply) {
        // Store conversation ID if provided
        if (data.conversationId) {
          setConversationId(data.conversationId);
        }
        
        const botMessage = { 
          sender: "bot", 
          text: data.reply,
          timestamp: new Date(),
          id: Date.now() + 1
        };
        setMessages(prev => [...prev, botMessage]);
        
        setConversationHistory([
          ...updatedHistory,
          { role: 'assistant', text: data.reply }
        ]);
      } else {
        setMessages(prev => [...prev, { 
          sender: "bot", 
          text: data.message || "Sorry, couldn't process that. Please try again.",
          timestamp: new Date(),
          id: Date.now() + 1
        }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      let errorMessage = "Connection issue. Please try again.";
      
      // Try to get error message from response if available
      if (err.response) {
        try {
          const errorData = await err.response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If can't parse JSON, use status text
          errorMessage = err.response.statusText || errorMessage;
        }
      } else if (err.message) {
        // Use the error message directly
        errorMessage = err.message;
        
        // Map common error messages to user-friendly ones
        if (err.message.includes('quota') || err.message.includes('rate limit') || err.message.includes('429')) {
          errorMessage = "⚠️ API quota exceeded. Free tier has limited requests. Please wait 1-2 minutes and try again.";
        } else if (err.message.includes('API key') || err.message.includes('401') || err.message.includes('403')) {
          errorMessage = "⚠️ API key issue. Please contact administrator.";
        } else if (err.message.includes('timeout') || err.message.includes('network')) {
          errorMessage = "⚠️ Connection timeout. Check your internet and try again.";
        } else if (err.message.includes('temporarily unavailable')) {
          errorMessage = "⚠️ Service busy. Please wait a moment and try again.";
        }
      }
      
      setMessages(prev => [...prev, { 
        sender: "bot", 
        text: errorMessage,
        timestamp: new Date(),
        id: Date.now() + 1
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (window.confirm('Clear chat history?')) {
      setMessages([
        { 
          sender: "bot", 
          text: "Hello! I'm FaceCraft AI 👋\n\nI help with:\n• Face shapes\n• Hairstyle recommendations\n• Grooming tips\n\nHow can I assist you?",
          timestamp: new Date(),
          id: Date.now()
        }
      ]);
      setConversationHistory([]);
      setConversationId(null);
      setFeedback({});
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fadeIn "
        onClick={() => setOpen(false)}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />
      
      <div
        className="
          fixed z-50
          top-20 right-4 sm:right-6
          w-[calc(100vw-2rem)] sm:w-[440px] max-w-[460px]
          h-[calc(100vh-7rem)] sm:h-[640px] max-h-[calc(100vh-7rem)]
          bg-white/95 backdrop-blur-2xl
          rounded-[28px] 
          shadow-[0_32px_100px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.8)_inset]
          border border-white/60
          overflow-hidden
          flex flex-col 
        "
        style={{
          animation: 'slideUpScale 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 32px 100px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.8) inset, 0 0 60px rgba(14,165,233,0.1)'
        }}
      >
        {/* HEADER - Premium Design */}
        <div className="
          relative
          bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-500
          px-6 py-5
          flex items-center justify-between
          overflow-hidden 
        ">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-[0.12]">
            <div 
              className="absolute inset-0 animate-pattern"
              style={{
                backgroundImage: 'radial-gradient(circle at 4px 4px, white 2px, transparent 0)',
                backgroundSize: '32px 32px'
              }}
            />
          </div>
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
          
          {/* Glow effect */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-400/30 rounded-full blur-3xl animate-pulse-slow" />
          
          <div className="flex items-center gap-4 relative z-10">
            {/* Premium Icon Container */}
            <div className="
              relative
              w-12 h-12 rounded-2xl
              bg-white/35 backdrop-blur-xl
              flex items-center justify-center
              shadow-[0_8px_24px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.4)_inset]
              border border-white/50
              ring-4 ring-white/20
            ">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-transparent" />
              <Zap size={22} className="text-white drop-shadow-lg relative z-10" fill="white" />
            </div>
            
            <div>
              <div className="font-bold text-white text-[17px] leading-tight tracking-tight drop-shadow-md">
                FaceCraft AI
              </div>
              <div className="text-xs text-sky-100/95 flex items-center gap-2 mt-1.5 font-semibold">
                <div className="relative">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_12px_rgba(74,222,128,0.8)] animate-pulse" />
                  <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping opacity-75" />
                </div>
                <span className="tracking-wide">Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 relative z-10">
            <button
              onClick={clearChat}
              className="
                p-2.5 rounded-xl
                bg-white/15 backdrop-blur-md
                hover:bg-white/25
                active:bg-white/35
                transition-all duration-200
                text-white/95 hover:text-white
                hover:scale-110 active:scale-95
                border border-white/20
                shadow-lg
              "
              title="Clear chat"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/>
              </svg>
            </button>
            <button 
              onClick={() => setOpen(false)} 
              className="
                p-2.5 rounded-xl
                bg-white/15 backdrop-blur-md
                hover:bg-white/25
                active:bg-white/35
                transition-all duration-200
                text-white/95 hover:text-white
                hover:scale-110 active:scale-95
                border border-white/20
                shadow-lg
              "
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* CHAT BODY - Premium Scroll Area */}
        <div className="
          flex-1 overflow-y-auto
          px-6 py-6
          space-y-5
          bg-gradient-to-b from-sky-50/30 via-white to-white
          custom-scroll-premium
        ">
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`
                flex gap-4 items-start
                group
                ${msg.sender === "user" ? "justify-end" : "justify-start"}
              `}
              style={{
                animation: `fadeInSlide 0.35s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.05}s both`
              }}
            >
              {/* Premium Avatar */}
              {msg.sender === "bot" ? (
                <div className="
                  relative
                  w-10 h-10 rounded-2xl
                  bg-gradient-to-br from-sky-100 via-sky-50 to-cyan-100
                  border-2 border-sky-200/90
                  flex items-center justify-center
                  flex-shrink-0
                  shadow-[0_4px_16px_rgba(14,165,233,0.2),0_0_0_1px_rgba(255,255,255,0.8)_inset]
                  ring-2 ring-sky-100/60
                ">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/60 to-transparent" />
                  <Bot size={18} className="text-sky-600 relative z-10" />
                </div>
              ) : (
                <div className="
                  relative
                  w-10 h-10 rounded-2xl
                  bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300
                  border-2 border-gray-300/90
                  flex items-center justify-center
                  flex-shrink-0
                  shadow-[0_4px_16px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.8)_inset]
                  ring-2 ring-gray-100/60
                ">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/60 to-transparent" />
                  <User size={18} className="text-gray-700 relative z-10" />
                </div>
              )}

              {/* Premium Message Bubble */}
              <div
                className={`
                  max-w-[78%]
                  px-5 py-3.5 rounded-[20px]
                  text-[14.5px] leading-relaxed
                  relative
                  ${msg.sender === "bot"
                    ? "bg-white/95 backdrop-blur-sm text-gray-800 border-2 border-gray-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.1),0_0_0_1px_rgba(255,255,255,0.9)_inset] ring-1 ring-gray-50/80"
                    : "bg-gradient-to-br from-sky-500 via-sky-500 to-cyan-500 text-white shadow-[0_6px_24px_rgba(14,165,233,0.35),0_0_0_1px_rgba(255,255,255,0.2)_inset] ring-2 ring-sky-400/40"
                  }
                `}
              >
                {/* Inner glow for user messages */}
                {msg.sender === "user" && (
                  <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                )}
                
                <div className="whitespace-pre-wrap break-words font-normal text-[14.5px] relative z-10">
                  {msg.text}
                </div>
                
                {/* Message Actions - Bot messages only */}
                {msg.sender === "bot" && (
                  <div className="
                    flex items-center justify-between
                    mt-3.5 pt-3
                    border-t border-gray-100/90
                  ">
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                      <Clock size={11} />
                      <span>{formatTime(msg.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        className="
                          p-2 rounded-xl
                          hover:bg-gray-100/80
                          active:bg-gray-200/80
                          transition-all duration-200
                          text-gray-500 hover:text-gray-700
                          hover:scale-110 active:scale-95
                          backdrop-blur-sm
                        "
                        title="Copy"
                      >
                        {copiedId === msg.id ? (
                          <Check size={13} className="text-emerald-600" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                      <button
                        onClick={() => handleFeedback(msg.id, 'like')}
                        className={`
                          p-2 rounded-xl
                          transition-all duration-200
                          hover:scale-110 active:scale-95
                          backdrop-blur-sm
                          ${feedback[msg.id] === 'like' 
                            ? 'bg-sky-100/90 text-sky-600 shadow-sm' 
                            : 'hover:bg-gray-100/80 text-gray-500 hover:text-gray-700'
                          }
                        `}
                        title="Helpful"
                      >
                        <ThumbsUp size={13} />
                      </button>
                      <button
                        onClick={() => handleFeedback(msg.id, 'dislike')}
                        className={`
                          p-2 rounded-xl
                          transition-all duration-200
                          hover:scale-110 active:scale-95
                          backdrop-blur-sm
                          ${feedback[msg.id] === 'dislike' 
                            ? 'bg-red-100/90 text-red-600 shadow-sm' 
                            : 'hover:bg-gray-100/80 text-gray-500 hover:text-gray-700'
                          }
                        `}
                        title="Not helpful"
                      >
                        <ThumbsDown size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Premium Typing Indicator */}
          {isTyping && (
            <div className="flex items-start gap-4 animate-fadeIn">
              <div className="
                relative
                w-10 h-10 rounded-2xl
                bg-gradient-to-br from-sky-100 via-sky-50 to-cyan-100
                border-2 border-sky-200/90
                flex items-center justify-center
                flex-shrink-0
                shadow-[0_4px_16px_rgba(14,165,233,0.2)]
                ring-2 ring-sky-100/60
              ">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/60 to-transparent" />
                <Bot size={18} className="text-sky-600 relative z-10 animate-pulse" />
              </div>
              <div className="typing-indicator-premium">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Premium Quick Suggestions */}
        {messages.length === 1 && !isTyping && (
          <div className="px-6 py-4 border-t border-gray-200/60 bg-gradient-to-b from-white/80 to-white backdrop-blur-md">
            <div className="flex flex-wrap gap-3">
              {quickSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(suggestion)}
                  className="
                    px-4 py-2.5
                    text-xs font-semibold
                    rounded-xl
                    bg-white/90 backdrop-blur-sm
                    border-2 border-gray-200/80
                    text-gray-700
                    hover:bg-gray-50/90
                    hover:border-sky-300/80
                    hover:shadow-md
                    hover:scale-105
                    transition-all duration-200
                    active:scale-95
                    shadow-sm
                    ring-1 ring-gray-100/50
                  "
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Premium Input Bar */}
        <div className="
          p-5
          border-t-2 border-gray-200/60
          bg-gradient-to-b from-white/95 to-white backdrop-blur-xl
          flex gap-3
          shadow-[0_-12px_32px_rgba(0,0,0,0.1)]
        ">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              className="
                w-full px-5 py-3.5
                rounded-2xl
                border-2 border-gray-200/80
                focus:border-sky-400 focus:ring-4 focus:ring-sky-100/60
                outline-none
                text-sm bg-white/90 backdrop-blur-sm
                transition-all duration-200
                placeholder:text-gray-400
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-[0_4px_12px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.9)_inset]
                hover:border-gray-300/80
                ring-1 ring-gray-100/50
              "
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isTyping}
              maxLength={500}
            />
            {input.length > 0 && input.length > 400 && (
              <div className="absolute bottom-2.5 right-4 text-[10px] text-gray-400 font-semibold">
                {input.length}/500
              </div>
            )}
          </div>

          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            className="
              relative
              bg-gradient-to-br from-sky-500 via-sky-500 to-cyan-500
              text-white
              px-7 py-3.5
              rounded-2xl
              shadow-[0_6px_24px_rgba(14,165,233,0.45),0_0_0_1px_rgba(255,255,255,0.2)_inset]
              hover:from-sky-600 hover:via-sky-600 hover:to-cyan-600
              hover:shadow-[0_8px_32px_rgba(14,165,233,0.55)]
              transition-all duration-200
              active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed
              disabled:hover:from-sky-500 disabled:hover:via-sky-500 disabled:hover:to-cyan-500
              flex items-center justify-center
              min-w-[56px]
              ring-4 ring-sky-400/20
              overflow-hidden
            "
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
            {isTyping ? (
              <Loader2 size={18} className="animate-spin relative z-10" />
            ) : (
              <Send size={18} className="relative z-10" />
            )}
          </button>
        </div>

        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }

            @keyframes slideUpScale {
              from {
                opacity: 0;
                transform: translateY(40px) scale(0.92);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }

            @keyframes fadeInSlide {
              from {
                opacity: 0;
                transform: translateY(12px) scale(0.96);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }

            @keyframes shimmer {
              0% {
                transform: translateX(-100%) skewX(-15deg);
              }
              100% {
                transform: translateX(200%) skewX(-15deg);
              }
            }

            @keyframes pattern {
              0% {
                background-position: 0 0;
              }
              100% {
                background-position: 32px 32px;
              }
            }

            @keyframes pulse-slow {
              0%, 100% {
                opacity: 0.3;
                transform: scale(1);
              }
              50% {
                opacity: 0.5;
                transform: scale(1.1);
              }
            }

            .animate-shimmer {
              animation: shimmer 4s infinite;
            }

            .animate-pattern {
              animation: pattern 20s linear infinite;
            }

            .animate-pulse-slow {
              animation: pulse-slow 4s ease-in-out infinite;
            }

            .typing-indicator-premium {
              background: white;
              padding: 14px 18px;
              border-radius: 18px;
              display: flex;
              gap: 6px;
              border: 2px solid #e5e7eb;
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255,255,255,0.9) inset;
              ring-1 ring-gray-50/80;
            }
            .typing-indicator-premium span {
              width: 8px;
              height: 8px;
              background: linear-gradient(135deg, #94a3b8, #64748b);
              border-radius: 50%;
              animation: typingDotPremium 1.4s infinite ease-in-out;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .typing-indicator-premium span:nth-child(2) { animation-delay: 0.2s; }
            .typing-indicator-premium span:nth-child(3) { animation-delay: 0.4s; }

            @keyframes typingDotPremium {
              0%, 100% { 
                opacity: 0.4; 
                transform: translateY(0) scale(0.85);
              }
              50% { 
                opacity: 1; 
                transform: translateY(-5px) scale(1.15);
              }
            }

            .custom-scroll-premium::-webkit-scrollbar { 
              width: 8px; 
            }
            .custom-scroll-premium::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scroll-premium::-webkit-scrollbar-thumb {
              background: linear-gradient(to bottom, #cbd5e1, #94a3b8, #64748b);
              border-radius: 12px;
              border: 2px solid transparent;
              background-clip: padding-box;
              box-shadow: inset 0 0 6px rgba(0,0,0,0.1);
            }
            .custom-scroll-premium::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(to bottom, #94a3b8, #64748b, #475569);
              background-clip: padding-box;
            }
          `}
        </style>
      </div>
    </>
  );
}
