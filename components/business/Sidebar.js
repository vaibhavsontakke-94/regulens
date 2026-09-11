import Link from "next/link";
import { useRouter } from "next/router";
import Logo from "@/components/Logo";
import { BUSINESS_NAV, isBizNavActive } from "./navConfig";
import { cx } from "@/lib/utils";

function NavItem({ item, collapsed, onClick }) {
  const router = useRouter();
  const active = isBizNavActive(router.pathname, item, item.exact);
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
          ? "bg-success-soft text-success"
          : "text-ink-subtle hover:bg-surface-hover hover:text-ink"
      )}
    >
      <Icon size={18} strokeWidth={active ? 2.2 : 1.8} className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-success" />}
    </Link>
  );
}

export default function BusinessSidebar({ collapsed, onToggle, mobileOpen, onClose }) {
  return (
    <>
      <aside
        className={cx(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-surface lg:flex",
          collapsed ? "w-[68px]" : "w-[256px]"
        )}
      >
        <LogoRow collapsed={collapsed} onToggle={onToggle} />
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {BUSINESS_NAV.map((item) => (
            <NavItem key={item.href} item={item} collapsed={collapsed} />
          ))}
        </nav>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <aside className="absolute inset-y-0 left-0 flex w-[300px] flex-col border-r border-line bg-surface shadow-2xl">
            <LogoRow collapsed={false} onToggle={onClose} />
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              {BUSINESS_NAV.map((item) => (
                <NavItem key={item.href} item={item} collapsed={false} onClick={onClose} />
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}

function LogoRow({ collapsed, onToggle }) {
  return (
    <div className={cx("flex h-16 items-center gap-2 border-b border-line px-4", collapsed && "justify-center px-0")}>
      {!collapsed && (
        <span className="flex items-center gap-2.5">
          <Logo showVersion={false} />
          <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success">
            Business
          </span>
        </span>
      )}
      {collapsed && <Logo showVersion={false} />}
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