import { useEffect, useState } from "react";
import { CheckCheck, BellOff, Check, Bell } from "lucide-react";
import GovernmentLayout from "@/components/government/GovernmentLayout";
import PageHeader, { SectionCard } from "@/components/government/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { govApi } from "@/lib/api";
import { fmtDateTime } from "@/lib/format";

const TYPE_META = {
  priority: { label: "Priority", variant: "red" },
  evidence: { label: "Evidence", variant: "green" },
  policy: { label: "Policy", variant: "blue" },
  deadline: { label: "Deadline", variant: "amber" },
  business: { label: "Business", variant: "blue" },
  report: { label: "Report", variant: "neutral" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    govApi
      .notifications()
      .then((data) => {
        if (active) setNotifications(data.notifications || []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const list = notifications;
  const unreadCount = list.filter((n) => n.unread !== false).length;

  function updateLocal(item, patch) {
    setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, ...patch } : n)));
  }

  async function markAllRead() {
    try {
      await govApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    } catch {
      /* keep local state */
    }
  }

  async function setReadState(item, unread) {
    updateLocal(item, { unread });
    try {
      await govApi.markNotification(item.id, { unread });
    } catch {
      /* keep optimistic local state */
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Government Intelligence"
        title="Notifications"
        description={`${unreadCount} unread of ${list.length} total, from the live workspace.`}
        actions={
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-line bg-surface px-3.5 text-sm font-medium text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </button>
        }
      />
      <SectionCard>
        {loading && <p className="py-8 text-center text-sm text-ink-faint">Loading notifications…</p>}
        {!loading && list.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <BellOff className="h-8 w-8 text-ink-faint" />
            <p className="text-sm text-ink-faint">You are all caught up.</p>
          </div>
        )}
        <ul className="divide-y divide-line">
          {list.map((n) => {
            const meta = TYPE_META[n.type] || TYPE_META.report;
            const isUnread = n.unread !== false;
            return (
              <li key={n.id} className="flex gap-4 py-4">
                <span
                  className={`mt-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    isUnread ? "bg-primary-soft text-primary" : "bg-surface-muted text-ink-faint"
                  }`}
                >
                  <Bell className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-ink">{n.title}</span>
                    <Badge variant={meta.variant} size="sm">{meta.label}</Badge>
                    {isUnread && <span className="h-2 w-2 rounded-full bg-primary" aria-label="Unread" />}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-ink-subtle">{n.body}</p>
                  <p className="mt-1 text-xs text-ink-faint">{fmtDateTime(n.time)}</p>
                </div>
                {!isUnread ? (
                  <button
                    type="button"
                    onClick={() => setReadState(n, true)}
                    data-testid="mark-unread"
                    className="mt-1 h-8 shrink-0 rounded-md px-2 text-xs font-semibold text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink"
                  >
                    Mark unread
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setReadState(n, false)}
                    className="mt-1 h-8 shrink-0 rounded-md px-2 text-xs font-semibold text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink"
                  >
                    <Check className="mr-1 inline h-3.5 w-3.5" />
                    Mark read
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </SectionCard>
      <p className="mt-4 text-xs text-ink-faint">Read state is tracked in the workspace and persisted across sessions.</p>
    </>
  );
}

NotificationsPage.getLayout = (page) => <GovernmentLayout title="Notifications">{page}</GovernmentLayout>;