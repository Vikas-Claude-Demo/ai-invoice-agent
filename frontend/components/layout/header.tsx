"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { Notification } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

export default function Header({ title }: { title?: string }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        api.notifications.list(data.user.id, true).then(setNotifications).catch(() => {});
      }
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => setNotifications((prev) => [payload.new as Notification, ...prev])
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  async function markAllRead() {
    if (!userId) return;
    await api.notifications.markAllRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-10">
      <h1 className="font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs bg-red-500">
                  {unread > 9 ? "9+" : unread}
                </Badge>
              )}
            </Button>
          } />
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex justify-between items-center">
              <span>Notifications</span>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-blue-600 font-normal hover:underline">
                  Mark all read
                </button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="p-4 text-sm text-gray-500 text-center">No notifications</div>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <DropdownMenuItem key={n.id} className={`flex flex-col items-start gap-0.5 ${!n.read ? "bg-blue-50" : ""}`}>
                  <span className="text-sm">{n.message}</span>
                  <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
