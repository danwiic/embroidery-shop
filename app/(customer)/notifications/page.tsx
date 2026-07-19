"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  orderId?: string | null;
};

const NotificationsPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [marking, setMarking] = useState(false);

  const fetchNotifs = () => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => setNotifications(data.notifications ?? []))
      .catch(() => {});
  };

  useEffect(() => { fetchNotifs(); }, []);

  const open = async (n: Notification) => {
    if (!n.read) {
      await fetch(`/api/notifications/${n.id}/read`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
      );
    }
    if (n.orderId) router.push(`/orders/${n.orderId}`);
  };

  const markAllRead = async () => {
    setMarking(true);
    await fetch("/api/notifications/read-all", { method: "PUT" });
    await fetchNotifs();
    setMarking(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!session) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-navy">Notifications</h1>
        {unreadCount > 0 && (
          <Button size="sm" variant="outlined" onClick={markAllRead} disabled={marking}>
            {marking ? "Marking..." : `Mark all as read (${unreadCount})`}
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="p-8">
          <EmptyState icon="inbox" title="No notifications" message="You're all caught up!" />
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              role="button"
              tabIndex={0}
              onClick={() => open(n)}
              onKeyDown={(e) => { if (e.key === "Enter") open(n); }}
              className={`rounded-xl shadow-card p-4 flex items-start gap-3 transition-colors cursor-pointer ${
                n.read ? "bg-white" : "bg-navy/[0.03] border border-navy/10"
              }`}
            >
              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.read ? "bg-border" : "bg-gold"}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.read ? "text-muted" : "font-medium text-foreground"}`}>
                  {n.title}
                </p>
                <p className="text-sm text-muted mt-0.5">{n.message}</p>
                <p className="text-xs text-muted/60 mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
