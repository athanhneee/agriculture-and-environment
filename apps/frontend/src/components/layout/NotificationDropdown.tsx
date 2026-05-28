"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Bell, AlertTriangle, X } from "lucide-react";
import { alertsApi, statisticsApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { io } from "socket.io-client";

const severityConfig: Record<string, { label: string; badgeClass: string; iconClass: string }> = {
  LOW: {
    label: "Thấp",
    badgeClass: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    iconClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  MEDIUM: {
    label: "Trung bình",
    badgeClass: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  HIGH: {
    label: "Cao",
    badgeClass: "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300",
    iconClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  CRITICAL: {
    label: "Nghiêm trọng",
    badgeClass: "border-destructive/30 bg-destructive/10 text-destructive",
    iconClass: "bg-destructive/10 text-destructive",
  },
};

function ToastNotification({ alert, onClose }: { alert: any; onClose: () => void }) {
  const sev = severityConfig[alert.severity] || severityConfig.LOW;

  return createPortal(
    <div className="fixed bottom-[30px] right-4 sm:right-6 lg:right-8 z-[9999] flex w-80 sm:w-96 items-start gap-3 rounded-xl border bg-card p-4 shadow-xl animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${sev.iconClass}`}>
        <AlertTriangle className="size-5" />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <h4 className="text-sm font-bold text-foreground truncate">{alert.title}</h4>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{alert.message}</p>
      </div>
      <button 
        onClick={onClose}
        className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition"
      >
        <X className="size-4" />
      </button>
    </div>,
    document.body
  );
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastAlert, setToastAlert] = useState<any | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchAlerts = async () => {
    try {
      const [data, stats] = await Promise.all([
        alertsApi.list(),
        statisticsApi.overview()
      ]);
      
      setUnreadCount(stats?.openAlertsCount || data.filter((a: any) => a.status === "OPEN").length);
      setAlerts(data.slice(0, 5)); // Show top 5 in dropdown
    } catch (error) {
      console.error("Lỗi khi tải thông báo:", error);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Poll every 30 seconds as fallback
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Socket.IO Real-time alerts
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Connected to Realtime Alerts Socket");
    });

    socket.on("alert:global-created", (newAlert: any) => {
      // 1. Show Toast
      setToastAlert(newAlert);
      setTimeout(() => setToastAlert(null), 5000);

      // 2. Update alerts list (add to top, keep max 5)
      setAlerts((prev) => [newAlert, ...prev].slice(0, 5));

      // 3. Increment unread count
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigate = () => {
    setIsOpen(false);
    router.push("/dashboard/alerts");
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) fetchAlerts();
          }}
          aria-label="Thông báo"
          className="relative flex size-10 items-center justify-center rounded-full border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition focus:outline-none"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-background animate-in zoom-in">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border bg-card shadow-lg animate-in fade-in zoom-in-95 z-50 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/30">
              <h3 className="font-semibold">Thông báo mới</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                  {unreadCount} chưa đọc
                </span>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[60vh]">
              {alerts.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center">
                  <Bell className="size-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">Bạn không có thông báo mới nào</p>
                </div>
              ) : (
                <div className="divide-y">
                  {alerts.map((alert) => {
                    const sev = severityConfig[alert.severity] || severityConfig.LOW;
                    return (
                      <button
                        key={alert.id}
                        onClick={handleNavigate}
                        className={`w-full text-left flex gap-3 p-4 hover:bg-muted/50 transition ${alert.status === 'OPEN' ? 'bg-muted/10' : 'opacity-75'}`}
                      >
                        <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${sev.iconClass}`}>
                          <AlertTriangle className="size-4" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold truncate text-foreground">{alert.title}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {alert.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground/80 mt-1.5 font-medium">
                            {new Date(alert.createdAt).toLocaleString("vi-VN")}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t p-2 bg-muted/10">
              <Link
                href="/dashboard/alerts"
                onClick={() => setIsOpen(false)}
                className="block w-full rounded-xl p-2 text-center text-sm font-semibold text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition dark:text-emerald-400 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
              >
                Xem tất cả cảnh báo
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Real-time Toast Notification — rendered via Portal to body so it never overlaps header elements */}
      {toastAlert && <ToastNotification alert={toastAlert} onClose={() => setToastAlert(null)} />}
    </>
  );
}
