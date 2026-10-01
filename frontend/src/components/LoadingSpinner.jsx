import { Loader2 } from "lucide-react";

/**
 * Professional Loading Spinner Component
 * 
 * Usage:
 * <LoadingSpinner size="md" text="Loading..." />
 */

export default function LoadingSpinner({ 
  size = "md", 
  text = "", 
  fullScreen = false,
  variant = "primary" 
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const variantClasses = {
    primary: "border-sky-500 border-t-transparent",
    secondary: "border-gray-300 border-t-gray-600",
    white: "border-white border-t-transparent",
    purple: "border-purple-500 border-t-transparent",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* SPINNER */}
      <div className="relative">
        {/* OUTER RING */}
        <div
          className={`
            ${sizeClasses[size]} 
            rounded-full border-4 
            ${variantClasses[variant]}
            animate-spin
          `}
        />
        {/* INNER GLOW */}
        <div
          className={`
            absolute inset-0 
            ${sizeClasses[size]} 
            rounded-full 
            ${variant === "primary" ? "bg-sky-500/20" : ""}
            ${variant === "purple" ? "bg-purple-500/20" : ""}
            animate-pulse
          `}
        />
      </div>

      {/* LOADING TEXT */}
      {text && (
        <p
          className={`
            text-sm font-medium
            ${variant === "white" ? "text-white" : "text-gray-600"}
            animate-pulse
          `}
        >
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
        <div className="relative">
          {/* BACKGROUND GLOW */}
          <div className="absolute inset-0 bg-sky-500/20 blur-3xl rounded-full animate-pulse" />
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
}
