import { ArrowLeft, Bell, Calendar, CheckCircle2, Pill } from "lucide-react";
import { Link } from "react-router-dom";
import { useNotifications } from "@/contexts/NotificationContext";

export default function NotificationCenterPage() {
  const { notifications, markAsRead } = useNotifications();

  return (
    <div className="min-h-screen bg-alan-background">
      <header className="sticky top-0 z-10 border-b border-alan-border bg-white px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <Link
            to="/card"
            className="flex h-10 w-10 items-center justify-center rounded-btn hover:bg-alan-border/30 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-alan-text-primary" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-alan-text-primary">Notifications</h1>
            <p className="text-sm text-alan-text-muted">Your recent alerts</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8 space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-alan-text-muted mx-auto mb-4 opacity-50" />
            <p className="text-alan-text-secondary">No notifications yet.</p>
          </div>
        ) : (
          notifications.map(notification => {
            const timeString = new Intl.DateTimeFormat("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(notification.created_at));

            return (
              <div
                key={notification.id}
                className={`flex items-start gap-4 rounded-card border p-4 transition-colors ${
                  notification.is_read ? "border-alan-border bg-white opacity-70" : "border-alan-indigo/30 bg-alan-indigo/5"
                }`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
                style={{ cursor: notification.is_read ? "default" : "pointer" }}
              >
                <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  notification.type === "medication" ? "bg-alan-teal/10 text-alan-teal" :
                  notification.type === "appointment" ? "bg-alan-blue/10 text-alan-blue" :
                  "bg-alan-indigo/10 text-alan-indigo"
                }`}>
                  {notification.type === "medication" ? <Pill className="h-5 w-5" /> :
                   notification.type === "appointment" ? <Calendar className="h-5 w-5" /> :
                   <CheckCircle2 className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-alan-text-primary">{notification.title}</h3>
                    <span className="text-xs text-alan-text-muted">{timeString}</span>
                  </div>
                  <p className="mt-1 text-sm text-alan-text-secondary">{notification.message}</p>
                  {!notification.is_read && (
                    <p className="mt-2 text-xs font-medium text-alan-indigo">Tap to mark as read</p>
                  )}
                </div>
                {!notification.is_read && (
                  <div className="h-2 w-2 mt-2 rounded-full bg-alan-indigo shrink-0" />
                )}
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
