import { useState, useEffect, useRef } from "react";
import { Bell, Check, X, BellOff, Info, CheckCircle2, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { notificationApi } from "../../../features/notifications/api/notificationApi";
import { useAuthStore } from "../../../features/auth/store/authStore";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { cn } from "../../lib/utils";

// Notification sound URL
const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export default function NotificationCenter() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const audioRef = useRef(new Audio(NOTIFICATION_SOUND));
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationApi.getAll();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const SOCKET_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api$/, "");
    const socket = io(SOCKET_BASE_URL);
    
    // Helper to join rooms
    const joinRooms = () => {
      const userId = user._id || user.id;
      if (!userId) {
        console.error("[NOTIF] Cannot join rooms: user ID missing", user);
        return;
      }
      
      console.log("[NOTIF] Attempting to join rooms...", { tenantId: user.tenantId, userId });
      
      // Join tenant room
      socket.emit("joinTenant", user.tenantId);
      
      // Join user room
      socket.emit("joinUser", { tenantId: user.tenantId, userId });
    };

    if (socket.connected) {
      joinRooms();
    }

    socket.on("connect", () => {
      console.log("[NOTIF] Socket connected:", socket.id);
      joinRooms();
    });

    socket.on("newNotification", (notification) => {
      console.log("Instant notification received:", notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      // Play sound
      audioRef.current.play().catch(e => console.log("Sound play error:", e));
      
      // Show toast
      toast.info(notification.title, {
        description: notification.message,
        action: {
          label: "View",
          onClick: () => {
            if (notification.link) navigate(notification.link);
            setOpen(true);
          }
        }
      });
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    return () => socket.disconnect();
  }, [user]);

  const markAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      toast.error("Failed to mark notifications as read");
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark read:", error);
    }
  };

  return (
    <div className="relative">
      <button
        id="notification-bell"
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors group"
      >
        <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-cyan-500 text-black text-[9px] font-black flex items-center justify-center rounded-full ring-2 ring-gray-900 border border-black/20">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => setOpen(false)}
          />
          <div className="fixed top-4 right-4 w-80 sm:w-96 max-h-[85vh] bg-gray-950/90 border border-gray-800 rounded-3xl shadow-2xl z-[9999] flex flex-col overflow-hidden animate-in slide-in-from-top-4 duration-300 backdrop-blur-xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-800/50 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h3 className="text-white font-black text-lg tracking-tight">Inbox</h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                  {unreadCount} Unread Notifications
                </p>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    title="Mark all as read"
                    className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl hover:bg-cyan-500/20 transition group"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800/50">
                    <BellOff className="w-6 h-6 text-gray-700" />
                  </div>
                  <p className="text-white font-bold text-sm">Everything's quiet</p>
                  <p className="text-gray-500 text-xs mt-1">Check back later for updates</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800/30">
                  {notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => {
                        if (!notif.isRead) markAsRead(notif._id);
                        if (notif.link) {
                          navigate(notif.link);
                          setOpen(false);
                        }
                      }}
                      className={cn(
                        "p-5 hover:bg-white/[0.03] transition-all cursor-pointer relative group",
                        !notif.isRead && "bg-cyan-500/[0.03]"
                      )}
                    >
                      <div className="flex gap-4">
                        <div className={cn(
                          "mt-1 p-2.5 rounded-2xl shrink-0 transition-transform group-hover:scale-105",
                          notif.type === "TASK_ASSIGNED" ? "bg-amber-500/10 text-amber-500" :
                          notif.type === "STATUS_CHANGED" ? "bg-cyan-500/10 text-cyan-400" :
                          notif.type === "CHAT_MESSAGE" ? "bg-emerald-500/10 text-emerald-400" :
                          "bg-violet-500/10 text-violet-400"
                        )}>
                          {notif.type === "CHAT_MESSAGE" ? (
                            <MessageSquare className="w-4 h-4" />
                          ) : (
                            <Info className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={cn(
                              "text-xs font-bold leading-none",
                              notif.isRead ? "text-gray-400" : "text-white"
                            )}>
                              {notif.title}
                            </p>
                            <span className="text-gray-600 text-[9px] font-bold uppercase whitespace-nowrap">
                              {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: false })}
                            </span>
                          </div>
                          <p className="text-gray-500 text-[11px] leading-relaxed mt-1.5 line-clamp-2 font-medium">
                            {notif.message}
                          </p>
                        </div>
                        {!notif.isRead && (
                          <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-2 shrink-0 animate-pulse" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-800/50 bg-black/40 text-center">
               <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.2em]">
                 Novintix Real-time Engine
               </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
