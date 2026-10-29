"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import {
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import { findWorkspacePage, workspacePages } from "@/lib/navigation";
import { authClient } from "@/lib/auth/client";

const compactQuery = "(max-width: 47.99rem)";

type NavTooltip = {
  label: string;
  top: number;
  left?: number;
  right?: number;
};

const navIcons: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
};

function subscribeToCompact(callback: () => void) {
  const media = window.matchMedia(compactQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getCompactSnapshot() {
  return window.matchMedia(compactQuery).matches;
}

function getCompactServerSnapshot() {
  return false;
}

function getTooltipPosition(element: HTMLElement, label: string): NavTooltip {
  const rect = element.getBoundingClientRect();
  const rail = element.closest(".workspace-sidebar")?.getBoundingClientRect() ?? rect;
  const isRtl = document.documentElement.dir === "rtl";

  return {
    label,
    top: rect.top + rect.height / 2,
    left: isRtl ? undefined : rail.right + 8,
    right: isRtl ? window.innerWidth - rail.left + 8 : undefined,
  };
}

type WorkspaceShellProps = {
  children: ReactNode;
  session?: { user?: { name?: string | null; email?: string | null } } | null;
};

export default function WorkspaceShell({ children, session }: WorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [navTooltip, setNavTooltip] = useState<NavTooltip | null>(null);
  const isCompactViewport = useSyncExternalStore(
    subscribeToCompact,
    getCompactSnapshot,
    getCompactServerSnapshot,
  );
  const isCollapsed = isSidebarCollapsed || isCompactViewport;
  const page = findWorkspacePage(pathname);
  const title = page?.title ?? "JobFlow";

  const user = session?.user;
  const userLabel = user?.name || user?.email || "Account";

  function toggleSidebar() {
    setNavTooltip(null);
    setSidebarCollapsed((collapsed) => !collapsed);
  }

  async function handleSignOut() {
    try {
      await (authClient as { signOut: () => Promise<unknown> }).signOut();
    } catch {
      // ignore
    }
    router.replace("/login");
  }

  function showNavTooltip(
    event: PointerEvent<HTMLAnchorElement> | FocusEvent<HTMLAnchorElement>,
    label: string,
  ) {
    if (!isCollapsed) {
      return;
    }

    if ("pointerType" in event && event.pointerType !== "mouse") {
      return;
    }

    setNavTooltip(getTooltipPosition(event.currentTarget, label));
  }

  function hideNavTooltip() {
    setNavTooltip(null);
  }

  return (
    <div className={`workspace-shell${isCollapsed ? " is-sidebar-collapsed" : ""}`}>
      <a className="workspace-skip-link" href="#workspace-content">
        Skip to content
      </a>
      <aside
        id="workspace-sidebar"
        className={`workspace-sidebar${isCollapsed ? " is-collapsed" : ""}`}
        aria-label="Workspace sidebar"
      >
        <Link className="workspace-brand" href="/dashboard" aria-label="JobFlow dashboard">
          <Image
            className="workspace-brand-image"
            src={isCollapsed ? "/images/collapsedLogo.jpg" : "/images/expandedLogo.jpg"}
            alt=""
            width={isCollapsed ? 1254 : 1774}
            height={isCollapsed ? 1254 : 887}
            sizes={isCollapsed ? "2.5rem" : "10rem"}
            preload
          />
        </Link>
        <nav className="workspace-nav" aria-label="Primary">
          <ul className="workspace-nav-list">
            {workspacePages.map((item) => {
              const Icon = navIcons[item.href] ?? LayoutDashboard;
              const isCurrent = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    className={`workspace-nav-link${isCurrent ? " is-current" : ""}`}
                    href={item.href}
                    aria-current={isCurrent ? "page" : undefined}
                    onPointerEnter={(event) => showNavTooltip(event, item.label)}
                    onPointerLeave={hideNavTooltip}
                    onFocus={(event) => showNavTooltip(event, item.label)}
                    onBlur={hideNavTooltip}
                  >
                    <Icon
                      size={20}
                      strokeWidth={2}
                      absoluteStrokeWidth
                      aria-hidden="true"
                    />
                    <span className={`workspace-nav-label${isCollapsed ? " visually-hidden" : ""}`}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="workspace-sidebar-footer">
          <button
            type="button"
            className="workspace-signout"
            onClick={handleSignOut}
            aria-label={isCollapsed ? "Sign out" : undefined}
            title={isCollapsed ? "Sign out" : undefined}
          >
            <LogOut size={20} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" />
            {isCollapsed ? (
              <span className="workspace-flyout workspace-collapse-flyout" aria-hidden="true">
                Sign out
              </span>
            ) : (
              <span className="workspace-signout-label">
                <span className="workspace-signout-user">{userLabel}</span>
                <span className="workspace-signout-text">Sign out</span>
              </span>
            )}
          </button>
          {!isCompactViewport && (
            <button
              type="button"
              className="workspace-collapse"
              aria-expanded={!isCollapsed}
              aria-controls="workspace-sidebar"
              aria-label={isCollapsed ? "Expand sidebar" : undefined}
              onClick={toggleSidebar}
            >
              {isCollapsed ? (
                <PanelLeftOpen
                  size={20}
                  strokeWidth={2}
                  absoluteStrokeWidth
                  aria-hidden="true"
                />
              ) : (
                <PanelLeftClose
                  size={20}
                  strokeWidth={2}
                  absoluteStrokeWidth
                  aria-hidden="true"
                />
              )}
              {isCollapsed ? (
                <span className="workspace-flyout workspace-collapse-flyout" aria-hidden="true">
                  Expand sidebar
                </span>
              ) : (
                <span className="workspace-collapse-label">Collapse sidebar</span>
              )}
            </button>
          )}
        </div>
      </aside>
      <div className="workspace-main">
        <header className="workspace-header">
          <div className="workspace-header-inner">
            <h1>{title}</h1>
            {page?.description ? <p>{page.description}</p> : null}
          </div>
        </header>
        <main id="workspace-content" className="workspace-content" tabIndex={-1}>
          {children}
        </main>
      </div>
      {navTooltip ? (
        <span
          className="workspace-flyout workspace-nav-tooltip"
          style={{ top: navTooltip.top, left: navTooltip.left, right: navTooltip.right }}
          aria-hidden="true"
        >
          {navTooltip.label}
        </span>
      ) : null}
    </div>
  );
}
