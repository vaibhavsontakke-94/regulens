import { useState } from "react";
import { Bell } from "lucide-react";
import BusinessLayout from "@/components/business/BusinessLayout";
import BusinessPageHeader, { SectionCard } from "@/components/business/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { NOTIFICATIONS } from "@/lib/businessData";
import { fmtDateTime } from "@/lib/format";

const TYPE_VARIANTS = {
  regulatory: "blue",
  deadline: "amber",
  problem: "red",
  scheme: "green",
  expansion: "green",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <>
      <BusinessPageHeader
        eyebrow="Workspace"
        title="Notifications"
        description="Stay updated on regulatory changes, deadlines and problem status."
        actions={
          unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink-subtle transition-colors hover:bg-surface-muted"
            >
              Mark all read
            </button>
          )
        }
      />

      <SectionCard
        title="Notifications"
        description={`${unreadCount} unread`}
      >
        <div className="space-y-1">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-surface-muted ${
                n.unread ? "bg-success-soft/20" : ""
              }`}
            >
              <Bell className={`mt-0.5 h-4 w-4 shrink-0 ${n.unread ? "text-success" : "text-ink-faint"}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm ${n.unread ? "font-semibold text-ink" : "font-medium text-ink-subtle"}`}>{n.title}</h3>
                  <Badge variant={TYPE_VARIANTS[n.type] || "neutral"} size="sm">{n.type}</Badge>
                  {n.unread && <span className="h-2 w-2 rounded-full bg-success" />}
                </div>
                <p className="mt-0.5 text-xs text-ink-faint">{n.body}</p>
                <p className="mt-0.5 text-[11px] text-ink-faint">{fmtDateTime(n.time)}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}

NotificationsPage.getLayout = (page) => {
  return <BusinessLayout>{page}</BusinessLayout>;
};