import { useState } from "react";
import { CheckCheck, BellOff, Check, Bell } from "lucide-react";
import GovernmentLayout from "@/components/government/GovernmentLayout";
import PageHeader, { SectionCard } from "@/components/government/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { NOTIFICATIONS } from "@/lib/mockData";
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
  const [read, setRead] = useState({});

  const list = NOTIFICATIONS;
  const unreadCount = list.filter((n) => !read[n.id]).length;

  return (
    <>
      <PageHeader
        eyebrow="Government Intelligence"
        title="Notifications"
        description={`${unreadCount} unread of ${list.length} total. Illustrative demo entries.`}
        actions={
          <button
            type="button"
            onClick={() => {
              const all = {};
              list.forEach((n) => (all[n.id] = true));
              setRead(all);
            }}
            className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-line bg-surface px-3.5 text-sm font-medium text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </button>
        }
      />
      <SectionCard>
        {list.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <BellOff className="h-8 w-8 text-ink-faint" />
            <p className="text-sm text-ink-faint">You are all caught up.</p>
          </div>
        )}
        <ul className="divide-y divide-line">
          {list.map((n) => {
            const meta = TYPE_META[n.type] || TYPE_META.report;
            const isUnread = !read[n.id];
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
                {!isUnread && (
                  <button
                    type="button"
                    onClick={() => setRead((r) => ({ ...r, [n.id]: false }))}
                    className="mt-1 h-8 shrink-0 rounded-md px-2 text-xs font-semibold text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink"
                  >
                    Mark unread
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </SectionCard>
      <p className="mt-4 text-xs text-ink-faint">Demo only — notification state is held locally for this session.</p>
    </>
  );
}

NotificationsPage.getLayout = (page) => <GovernmentLayout title="Notifications">{page}</GovernmentLayout>;