/**
 * Skeleton Loader Component for Content Placeholders
 * 
 * Usage:
 * <SkeletonLoader type="card" />
 * <SkeletonLoader type="text" lines={3} />
 * <SkeletonLoader type="avatar" />
 */

export default function SkeletonLoader({ 
  type = "card", 
  lines = 1,
  className = "" 
}) {
  // Card Skeleton
  if (type === "card") {
    return (
      <div className={`bg-white rounded-2xl p-6 border border-gray-200 shadow-md ${className}`}>
        <div className="animate-pulse space-y-4">
          {/* AVATAR/ICON */}
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
          {/* CONTENT */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  // Text Skeleton
  if (type === "text") {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`
              h-4 bg-gray-200 rounded animate-pulse
              ${i === lines - 1 ? "w-3/4" : "w-full"}
            `}
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    );
  }

  // Avatar Skeleton
  if (type === "avatar") {
    return (
      <div className={`h-12 w-12 rounded-full bg-gray-200 animate-pulse ${className}`} />
    );
  }

  // Button Skeleton
  if (type === "button") {
    return (
      <div className={`h-10 w-24 rounded-lg bg-gray-200 animate-pulse ${className}`} />
    );
  }

  // Image Skeleton
  if (type === "image") {
    return (
      <div className={`bg-gray-200 rounded-lg animate-pulse ${className}`} style={{ aspectRatio: "16/9" }} />
    );
  }

  // List Item Skeleton
  if (type === "list-item") {
    return (
      <div className={`flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 ${className}`}>
        <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  // Default: Simple box
  return (
    <div className={`bg-gray-200 rounded-lg animate-pulse ${className}`} />
  );
}
