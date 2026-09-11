import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Bell, ChevronDown, IdCard, LogOut, Percent, Settings, User } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useBusinessProfile } from "@/components/business/BusinessProfileContext";
import { getSession, clearSession } from "@/lib/authSession";
import { NOTIFICATIONS } from "@/lib/businessData";
import { cx } from "@/lib/utils";

function ProfileMenu({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();
  const [session, setSession] = useState(null);
  const { display, completion } = useBusinessProfile();

  useEffect(() => setSession(getSession()), []);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const businessName = display?.name || session?.businessName || "Your Business";
  const industry = display?.industry || "";
  const initials = businessName.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  function handleSignOut() {
    clearSession();
    setOpen(false);
    router.push("/business/login");
  }

  function go(href) {
    setOpen(false);
    router.push(href);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-surface-muted"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-success text-white text-sm font-semibold">{initials}</span>
        <span className="hidden text-left md:block">
          <span className="block max-w-[140px] truncate text-sm font-semibold leading-tight text-ink">{businessName}</span>
          {industry && <span className="block max-w-[140px] truncate text-[11px] leading-tight text-ink-faint">{industry}</span>}
        </span>
        <ChevronDown size={14} aria-hidden="true" className={cx("hidden text-ink-subtle transition-transform sm:block", open && "rotate-180")} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-panel border border-line bg-surface p-1 shadow-raised">
          <div className="flex items-center gap-3 px-3 py-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success text-white font-semibold">{initials}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink">{businessName}</span>
              <span className="block truncate text-xs text-ink-faint">{industry || "Business Portal"}</span>
            </span>
          </div>
          <div className="mx-4 flex items-center gap-2 rounded-md bg-surface-muted px-3 py-2">
            <ProgressMini value={completion} />
            <span className="text-xs font-medium text-ink-subtle">Profile {completion}% complete</span>
          </div>
          <div className="mx-4 border-t border-line" />
          <button type="button" role="menuitem" onClick={() => go("/business/profile")} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink">
            <User className="h-4 w-4" aria-hidden="true" />
            Business Profile
          </button>
          <button type="button" role="menuitem" onClick={() => go("/business/profile")} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink">
            <IdCard className="h-4 w-4" aria-hidden="true" />
            Edit Business Information
          </button>
          <button type="button" role="menuitem" onClick={() => go("/business/profile")} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink">
            <Percent className="h-4 w-4" aria-hidden="true" />
            Profile Completion
          </button>
          <button type="button" role="menuitem" onClick={() => go("/business/settings")} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink">
            <Settings className="h-4 w-4" aria-hidden="true" />
            Settings
          </button>
          <div className="mx-4 border-t border-line" />
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger-soft"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function ProgressMini({ value }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
      <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${value || 0}%` }} />
    </div>
  );
}

export default function BusinessTopBar({ onMenuClick }) {
  const router = useRouter();
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-background/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-10 w-10 items-center justify-center rounded-[10px] text-ink-subtle transition-colors hover:bg-surface-muted lg:hidden"
        aria-label="Open navigation menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <ThemeToggle className="hidden sm:block" />
        <button
          type="button"
          onClick={() => router.push("/business/notifications")}
          className="relative flex h-10 w-10 items-center justify-center rounded-[10px] text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink"
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => router.push("/business/settings")}
          className="flex h-10 w-10 items-center justify-center rounded-[10px] text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink"
          aria-label="Open business settings"
        >
          <Settings className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>
        <ProfileMenu />
      </div>
    </header>
  );
}