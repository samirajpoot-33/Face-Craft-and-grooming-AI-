import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { Bell, Check, CheckCheck, Sparkles, Trash2, X } from "lucide-react";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationApi,
} from "../utils/api";

const NOTIFICATION_ICONS = {
  face_analysis_complete: Sparkles,
  hairstyle_recommendation: Sparkles,
  skin_tip: Sparkles,
  new_feature: Sparkles,
  security_alert: Bell,
  profile_photo_reminder: Bell,
  weekly_progress: Bell,
  beard_reminder: Bell,
  hairstyle_maintenance: Bell,
  makeup_saved: Sparkles,
};

function formatTimeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m Ago`;
  if (diffHours < 24) return `${diffHours}h Ago`;
  if (diffDays < 7) return `${diffDays}d Ago`;
  return date.toLocaleDateString();
}

export default function NotificationBell({ size = "md" }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);
  const previousUnreadCountRef = useRef(null);
  const [newNotificationToast, setNewNotificationToast] = useState(null);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications({ limit: 15 });
      if (res.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount ?? 0);
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadNotificationCount();
      if (res.success) {
        const newCount = res.unreadCount ?? 0;
        const prev = previousUnreadCountRef.current;
        if (prev !== null && newCount > prev) {
          const diff = newCount - prev;
          setNewNotificationToast(
            diff === 1 ? "You have a new notification!" : `You have ${diff} new notifications!`
          );
          setTimeout(() => setNewNotificationToast(null), 5000);
        }
        previousUnreadCountRef.current = newCount;
        setUnreadCount(newCount);
      }
    } catch (err) {
      console.error("Fetch unread count error:", err);
    }
  };

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const res = await getUnreadNotificationCount();
        if (mounted && res.success) {
          const c = res.unreadCount ?? 0;
          previousUnreadCountRef.current = c;
          setUnreadCount(c);
        }
      } catch (_) {}
    };
    run();
    const interval = setInterval(fetchUnreadCount, 20000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchUnreadCount();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchNotifications().finally(() => setLoading(false));
      // Prevent body scroll when panel is open
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      window.dispatchEvent(new CustomEvent("notification-panel-state", { detail: { open: true } }));
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      window.dispatchEvent(new CustomEvent("notification-panel-state", { detail: { open: false } }));
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target) && !buttonRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleMarkAsRead = async (id, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all as read error:", err);
    }
  };

  const handleNotificationClick = (n) => {
    if (!n.is_read) handleMarkAsRead(n.id);
    setOpen(false);
  };

  const handleDelete = async (id, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const wasUnread = notifications.some((n) => n.id === id && !n.is_read);
    try {
      await deleteNotificationApi(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Delete notification error:", err);
    }
  };

  const formattedDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  });

  const panelContent = (
    <div className={`fixed inset-0 z-[10000] overflow-hidden transition-all duration-500 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      {/* Backdrop – made transparent to avoid unwanted gray overlay */}
      <div 
        className={`absolute inset-0 bg-transparent backdrop-blur-sm transition-opacity duration-500 ease-in-out ${open ? "opacity-100" : "opacity-0"}`}
        onClick={() => setOpen(false)}
      />
      
      {/* Panel */}
      <div
        ref={panelRef}
        className={`absolute top-0 right-0 h-full w-full max-w-[420px] bg-slate-950/95 backdrop-blur-3xl border-l border-white/10  transition-transform duration-500 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 pt-8 bg-gradient-to-b from-sky-500/5 to-transparent relative">
            <div className="flex justify-between items-start mb-1">
              <span className="text-sky-400/80 text-[11px] font-bold uppercase tracking-widest">Today • {formattedDate}</span>
              <button 
                onClick={() => setOpen(false)}
                className="p-1.5 -mr-1.5 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <h2 className="text-3xl font-extrabold text-white mt-3 tracking-tight flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-sm font-bold border border-sky-500/30">
                  {unreadCount} new
                </span>
              )}
            </h2>
            
            <div className="mt-8 flex items-center justify-between pb-4 border-b border-white/10">
               <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Recent Updates</span>
               {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[12px] text-sky-400 hover:text-sky-300 flex items-center gap-1.5 font-semibold transition-colors group"
                >
                  <CheckCheck size={14} className="group-hover:scale-110 transition-transform" />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40">
                <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(56,189,248,0.5)]"></div>
                <p className="mt-4 text-sky-400/70 text-xs font-medium uppercase tracking-wider">Loading updates...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-60 text-slate-500">
                <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mb-4 border border-white/5 shadow-inner">
                  <Bell size={32} className="opacity-20" />
                </div>
                <p className="text-sm font-medium">You're all caught up!</p>
                <p className="text-xs text-slate-600 mt-1">No new notifications right now.</p>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {notifications.map((n) => {
                  const Icon = NOTIFICATION_ICONS[n.type] || Bell;
                  return (
                    <div 
                      key={n.id} 
                      className={`
                        group relative flex items-start gap-4 p-4 rounded-2xl transition-all duration-300
                        ${!n.is_read 
                          ? "bg-gradient-to-r from-sky-500/10 to-transparent border border-sky-500/20" 
                          : "bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                        }
                      `}
                    >
                      <Link
                        to={n.link || "#"}
                        onClick={() => handleNotificationClick(n)}
                        className="flex flex-1 items-start gap-4 min-w-0"
                      >
                        {/* Avatar / Icon container */}
                        <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg ${!n.is_read ? "bg-gradient-to-br from-sky-400 to-sky-600" : "bg-slate-800"}`}>
                           <Icon size={20} className={!n.is_read ? "text-white" : "text-slate-400"} />
                        </div>
                        
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <h4 className={`text-[15px] truncate ${!n.is_read ? "text-white font-bold" : "text-slate-300 font-semibold"}`}>
                              {n.title}
                            </h4>
                            {!n.is_read && (
                              <div className="shrink-0 w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)] mt-1.5" />
                            )}
                          </div>
                          
                          <p className={`text-[13px] line-clamp-2 leading-relaxed ${!n.is_read ? "text-slate-300" : "text-slate-500"}`}>
                            {n.message}
                          </p>

                          {/* Time at the end */}
                          <div className="mt-2.5">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                              {formatTimeAgo(n.created_at)}
                            </span>
                          </div>
                        </div>
                      </Link>

                      {/* Actions */}
                      <div className="flex flex-col items-center justify-start gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {!n.is_read && (
                          <button
                            onClick={(e) => handleMarkAsRead(n.id, e)}
                            className="p-2 rounded-full bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 transition-colors"
                            title="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(n.id, e)}
                          className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="p-5 border-t border-white/10 bg-slate-950/50 backdrop-blur-md">
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center w-full py-3.5 rounded-xl bg-white/[0.03] text-slate-300 font-bold hover:bg-white/[0.08] hover:text-white border border-white/5 transition-all text-xs uppercase tracking-widest group"
            >
              View History
              <Sparkles size={14} className="ml-2 text-sky-400 group-hover:text-sky-300 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* New notification toast popup */}
      {newNotificationToast && typeof document !== "undefined" && createPortal(
        <div
          data-notification-toast
          onClick={(e) => {
            e.stopPropagation();
            setNewNotificationToast(null);
            setOpen(true);
          }}
          className="fixed bottom-6 right-6 z-[9999] px-5 py-4 rounded-2xl bg-slate-900/95 text-white font-medium shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-xl flex items-center gap-4 animate-fade-in-up max-w-[340px] cursor-pointer hover:border-sky-500/50 transition-all group"
          role="button"
          tabIndex={0}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(56,189,248,0.4)]">
            <Bell size={24} className="text-white group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <p className="text-sm font-bold text-white mb-0.5">New Update</p>
            <p className="text-xs text-sky-200/80 leading-relaxed">{newNotificationToast}</p>
          </div>
        </div>,
        document.body
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(prev => !prev);
        }}
        className={`
          group relative flex items-center justify-center rounded-full
          transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(56,189,248,0.3)] hover:scale-105
          ${size === "sm" ? "w-8 h-8" : "w-10 h-10"}
          ${open 
            ? "bg-slate-900 border-sky-400/80" 
            : "bg-slate-950 border-slate-700/50 hover:border-sky-400/80"
          }
          border
        `}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-sky-500 to-cyan-400 transition-opacity duration-300 ${open ? 'opacity-30' : 'opacity-10 group-hover:opacity-30'}`} />
        <Bell size={size === "sm" ? 14 : 18} className={`relative z-10 transition-colors duration-300 ${open ? "text-sky-400" : "text-slate-300 group-hover:text-white"}`} />
        {unreadCount > 0 && (
          <span
            className={`
              absolute flex items-center justify-center
              text-white font-black
              rounded-full ring-2 ring-slate-950
              bg-gradient-to-r from-sky-500 to-cyan-400 z-20 shadow-[0_0_10px_rgba(56,189,248,0.6)]
              ${size === "sm" ? "-top-0.5 -right-0.5 min-w-[14px] h-[14px] text-[8px]" : "-top-1 -right-1 min-w-[20px] h-[20px] px-1 text-[10px]"}
            `}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {typeof document !== "undefined" && createPortal(panelContent, document.body)}
    </div>
  );
}
