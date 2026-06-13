"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck, Trash2, X, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  getNotifications, getUnreadCount,
  markAsRead, markAllAsRead, deleteNotification,
} from "@/lib/actions/notifications";
import type { Notification } from "@/lib/actions/notifications";
import { formatRelativeTime } from "@/lib/utils/index";
import { cn } from "@/lib/utils";

const typeConfig = {
  info:    { icon: Info,          color: "text-sky-500", bg: "bg-sky-500/10"  },
  warning: { icon: AlertTriangle, color: "text-amber-500",  bg: "bg-amber-500/10"   },
  success: { icon: CheckCircle,   color: "text-emerald-500",bg: "bg-emerald-500/10" },
  error:   { icon: XCircle,       color: "text-red-500",    bg: "bg-red-500/10"     },
};

export function NotificationBell({ businessId }: { businessId: string }) {
  const [open,          setOpen]          = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);
  const ref    = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load notifications
  const load = useCallback(async () => {
    setLoading(true);
    const [data, count] = await Promise.all([getNotifications(20), getUnreadCount()]);
    setNotifications(data);
    setUnreadCount(count);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Real-time subscription
  useEffect(() => {
    const supabase = createClient();
    const channel  = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `business_id=eq.${businessId}` },
        () => { load(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [businessId, load]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleMarkRead(id: string) {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
    await markAsRead(id);
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    await markAllAsRead();
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    const wasUnread = notifications.find((n) => n.id === id)?.read === false;
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    await deleteNotification(id);
  }

  function handleClick(n: Notification) {
    if (!n.read) handleMarkRead(n.id);
    if (n.link) { router.push(n.link); setOpen(false); }
  }

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        title="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-sky-600 text-white text-[10px] font-bold flex items-center justify-center px-0.5 leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                >
                  <CheckCheck size={14} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="py-8 space-y-3 px-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 bg-muted rounded-xl flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-3 w-32 bg-muted rounded mb-1.5" />
                      <div className="h-2.5 w-48 bg-muted/60 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell size={28} className="text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = typeConfig[n.type] ?? typeConfig.info;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 transition-colors group",
                      n.link ? "cursor-pointer hover:bg-accent" : "cursor-default",
                      !n.read && "bg-sky-500/5"
                    )}
                  >
                    {/* Icon */}
                    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5", cfg.bg)}>
                      <cfg.icon size={15} className={cfg.color} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm truncate", n.read ? "text-foreground/70" : "text-foreground font-medium")}>
                          {n.title}
                        </p>
                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!n.read && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                              title="Mark as read"
                              className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Check size={12} />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDelete(n.id, e)}
                            title="Delete"
                            className="p-1 rounded text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      {n.body && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                      )}
                      <p className="text-xs text-muted-foreground/50 mt-1">
                        {formatRelativeTime(n.created_at)}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
