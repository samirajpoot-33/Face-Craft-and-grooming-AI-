import { MessageCircle, Sparkles, Bot } from "lucide-react";
import { useState } from "react";

export default function AIChatButton({ open, setOpen }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={() => setOpen(true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        fixed bottom-20 right-4 sm:right-6 z-[9999]
        w-16 h-16
        rounded-2xl
        bg-gradient-to-br from-sky-500 via-sky-500 to-cyan-500
        shadow-[0_8px_32px_rgba(14,165,233,0.5),0_0_0_1px_rgba(255,255,255,0.15)_inset]
        flex items-center justify-center
        hover:scale-110 hover:shadow-[0_12px_48px_rgba(14,165,233,0.7),0_0_0_1px_rgba(255,255,255,0.25)_inset]
        transition-all duration-300 ease-out
        ring-4 ring-sky-400/30
        overflow-visible
        group
        relative
        border border-white/20
        ${open ? 'opacity-30 scale-90 pointer-events-none' : 'opacity-100'}
      `}
      style={{ 
        position: 'fixed',
        zIndex: 99999,
        bottom: '6rem',
        right: '1.5rem'
      }}
      aria-label="Open FaceCraft AI Assistant"
      disabled={open}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-cyan-400 to-sky-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Pulse ring on hover */}
      <div className="absolute inset-0 rounded-2xl bg-sky-400/40 animate-ping opacity-0 group-hover:opacity-100" style={{ animationDuration: '1.5s' }} />
      
      {/* Inner glow */}
      <div className="absolute inset-[2px] rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Icon Container */}
      <div className="relative z-10 flex items-center justify-center">
        {isHovered ? (
          <div className="relative transform transition-all duration-300">
            <Bot 
              size={30} 
              className="text-white drop-shadow-2xl" 
              strokeWidth={2}
              fill="rgba(255,255,255,0.15)"
            />
            <div className="absolute -top-0.5 -right-0.5">
              <Sparkles 
                size={14} 
                className="text-yellow-300 drop-shadow-lg" 
                fill="currentColor"
              />
            </div>
          </div>
        ) : (
          <MessageCircle 
            size={30} 
            className="text-white drop-shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" 
            strokeWidth={2}
            fill="rgba(255,255,255,0.12)"
          />
        )}
      </div>
      
      {/* Notification badge - only show when not open */}
      {!open && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 rounded-full border-[3px] border-white shadow-[0_2px_12px_rgba(74,222,128,0.7)] flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full shadow-inner" />
          <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
        </div>
      )}
      
      {/* Ripple effect on click */}
      <div className="absolute inset-0 rounded-2xl bg-white/30 opacity-0 group-active:opacity-100 group-active:animate-ripple" />
      
      <style>
        {`
          @keyframes ripple {
            0% {
              transform: scale(0);
              opacity: 1;
            }
            100% {
              transform: scale(2);
              opacity: 0;
            }
          }
          .animate-ripple {
            animation: ripple 0.6s ease-out;
          }
        `}
      </style>
    </button>
  );
}
