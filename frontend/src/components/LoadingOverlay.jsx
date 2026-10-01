import LoadingSpinner from "./LoadingSpinner";

/**
 * Full-Screen Loading Overlay Component
 * 
 * Usage:
 * <LoadingOverlay message="Loading dashboard..." />
 */

export default function LoadingOverlay({ 
  message = "Loading...", 
  variant = "primary" 
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
      {/* BACKGROUND GLOW EFFECTS */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-sky-500/20 blur-[140px] rounded-full animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 blur-[140px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* CONTENT */}
      <div className="relative z-10 text-center">
        <LoadingSpinner size="xl" text={message} variant={variant} />
      </div>
    </div>
  );
}
