import { Sparkles } from "lucide-react";

/**
 * Page Loader Component - For page transitions
 * 
 * Usage:
 * <PageLoader message="Loading page..." />
 */

export default function PageLoader({ message = "Loading..." }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-sky-500/20 blur-[140px] rounded-full animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 blur-[140px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full" />

      {/* CONTENT */}
      <div className="relative z-10 text-center">
        {/* ICON WITH ANIMATION */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-sky-500/30 blur-2xl rounded-full animate-pulse" />
          <div className="relative bg-gradient-to-br from-sky-500/20 to-cyan-500/20 rounded-full p-6 backdrop-blur-sm border border-sky-500/30">
            <Sparkles className="text-sky-400 animate-pulse" size={48} />
          </div>
        </div>

        {/* SPINNER */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-sky-500/30 border-t-sky-500 animate-spin" />
            <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }} />
          </div>
        </div>

        {/* MESSAGE */}
        <p className="text-slate-200 font-semibold text-lg mt-4 animate-pulse">
          {message}
        </p>
        <p className="text-slate-400 text-sm mt-2">Please wait a moment</p>

        {/* LOADING DOTS */}
        <div className="flex justify-center gap-2 mt-6">
          <div className="h-2 w-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
