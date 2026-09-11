import Link from "next/link";
import { useRouter } from "next/router";
import Logo from "@/components/Logo";
import { GOVERNMENT_NAV, isGovNavActive } from "./navConfig";
import { cx } from "@/lib/utils";

function NavItem({ item, collapsed, onClick }) {
  const router = useRouter();
  const active = isGovNavActive(router.pathname, item, item.exact);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={cx(
        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        collapsed && "justify-center px-0",
        active
          ? "bg-primary-soft text-primary"
          : "text-ink-subtle hover:bg-surface-hover hover:text-ink"
      )}
    >
      <Icon size={18} strokeWidth={active ? 2.2 : 1.8} className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
      )}
    </Link>
  );
}

function NavGroup({ group, collapsed, onClick }) {
  return (
    <div className="space-y-1">
      {!collapsed && (
        <p className="px-3 pb-1 text-2xs font-semibold uppercase tracking-wider text-ink-faint">
          {group.group}
        </p>
      )}
      {group.items.map((item) => (
        <NavItem key={item.href} item={item} collapsed={collapsed} onClick={onClick} />
      ))}
    </div>
  );
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onClose }) {
  return (
    <>
      <aside
        className={cx(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-surface lg:flex",
          collapsed ? "w-[68px]" : "w-[252px]"
        )}
      >
        <LogoRow collapsed={collapsed} onToggle={onToggle} />
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {GOVERNMENT_NAV.map((group) => (
            <NavGroup
              key={group.group}
              group={group}
              collapsed={collapsed}
            />
          ))}
        </nav>
        <BottomCell collapsed={collapsed} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[286px] flex-col border-r border-line bg-surface shadow-2xl">
            <LogoRow collapsed={false} onToggle={onClose} />
            <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
              {GOVERNMENT_NAV.map((group) => (
                <NavGroup key={group.group} group={group} collapsed={false} onClick={onClose} />
              ))}
            </nav>
            <BottomCell collapsed={false} />
          </aside>
        </div>
      )}
    </>
  );
}

function LogoRow({ collapsed, onToggle }) {
  return (
    <div
      className={cx(
        "flex h-16 items-center border-b border-line px-4",
        collapsed && "justify-center px-0"
      )}
    >
      {!collapsed && <Logo className="h-7 w-auto" />}
      {collapsed && <Logo className="h-7 w-auto" />}
      {!collapsed && (
        <button
          onClick={onToggle}
          title="Collapse sidebar"
          className="ml-auto hidden -mr-1 rounded-md p-1.5 text-ink-faint transition-colors hover:bg-surface-hover hover:text-ink lg:inline-flex"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m11 17-5-5 5-5" />
            <path d="m18 17-5-5 5-5" />
          </svg>
        </button>
      )}
    </div>
  );
}

function BottomCell({ collapsed }) {
  const router = useRouter();
  const active = router.pathname.startsWith("/government/profile");
  return (
    <div className="border-t border-line p-3">
      <Link
        href="/government/profile"
        title={collapsed ? "Profile & settings" : undefined}
        className={cx(
          "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          collapsed && "justify-center px-0",
          active ? "bg-primary-soft text-primary" : "text-ink-subtle hover:bg-surface-hover hover:text-ink"
        )}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="shrink-0">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
        </svg>
        {!collapsed && <span>Profile & settings</span>}
      </Link>
    </div>
  );
}