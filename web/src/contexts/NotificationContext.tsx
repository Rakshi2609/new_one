import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Notification as AppNotification } from "@/types/models";
import { getNotifications, markNotificationRead } from "@/api/client";

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      
      setNotifications(prev => {
        const newUnread = data.filter(n => !n.is_read && !prev.find(p => p.id === n.id));
        
        if (newUnread.length > 0 && Notification.permission === "granted") {
          newUnread.forEach(n => {
            new window.Notification(n.title, { body: n.message });
          });
        }
        
        return data;
      });
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds for demo
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
}
