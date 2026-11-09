"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  BadgeCheck,
  Briefcase,
  ChevronDown,
  CircleUserRound,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { findWorkspacePage, workspacePages } from "@/lib/navigation";
import { getInitials } from "@/lib/profile";
import { authClient } from "@/lib/auth/client";

const navIcons: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/applications": Briefcase,
};

type WorkspaceShellProps = {
  children: ReactNode;
  session?: {
    user?: {
      name?: string | null;
      email?: string | null;
      emailVerified?: boolean | null;
    };
  } | null;
};

export default function WorkspaceShell({ children, session }: WorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAccountOpen, setAccountOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);
  const page = findWorkspacePage(pathname);
  const title = page?.title ?? "JobFlow";

  const user = session?.user;
  const userLabel = user?.name || user?.email || "Account";
  const userEmail = user?.email ?? null;
  const initials = getInitials(userLabel);
  const isEmailVerified = Boolean(user?.emailVerified);

  useEffect(() => {
    if (!isAccountOpen) {
      return;
    }

    function closeOnOutsidePress(event: globalThis.PointerEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAccountOpen(false);
        accountButtonRef.current?.focus();
      }
    }

    function closeOnFocusLeave(event: Event) {
      if (
        event.target instanceof Node &&
        accountRef.current &&
        !accountRef.current.contains(event.target)
      ) {
        setAccountOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("focusin", closeOnFocusLeave);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("focusin", closeOnFocusLeave);
    };
  }, [isAccountOpen]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function closeOnOutsidePress(event: globalThis.PointerEvent) {
      const target = event.target as Node;

      if (
        !menuButtonRef.current?.contains(target) &&
        !mobileMenuRef.current?.contains(target)
      ) {
        setMenuOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMenuOpen]);

  function toggleAccount() {
    setMenuOpen(false);
    setAccountOpen((open) => !open);
  }

  function toggleMenu() {
    setAccountOpen(false);
    setMenuOpen((open) => !open);
  }

  async function handleSignOut() {
    setAccountOpen(false);

    try {
      await authClient.signOut();
    } catch {
      // ignore
    }
    router.replace("/login");
  }

  function renderNavLinks(linkClassName: string, onActivate?: () => void) {
    return workspacePages
      .filter((item) => item.inPrimaryNav !== false)
      .map((item) => {
        const Icon = navIcons[item.href];
        const isCurrent = pathname === item.href;

        return (
          <li key={item.href}>
            <Link
              className={`${linkClassName}${isCurrent ? " is-current" : ""}`}
              href={item.href}
              aria-current={isCurrent ? "page" : undefined}
              onClick={onActivate}
            >
              {Icon ? (
                <Icon size={18} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
              ) : null}
              <span>{item.label}</span>
            </Link>
          </li>
        );
      });
  }

  return (
    <div className="workspace-shell">
      <a className="workspace-skip-link" href="#workspace-content">
        Skip to content
      </a>
      <header className="workspace-header">
        <div className="workspace-header-inner">
          <Link
            className="workspace-wordmark"
            href="/dashboard"
            aria-label="JobFlow dashboard"
          >
            <span className="workspace-wordmark-dot" aria-hidden="true" />
            JobFlow
          </Link>
          <nav className="workspace-nav" aria-label="Primary">
            <ul className="workspace-nav-list">{renderNavLinks("workspace-nav-link")}</ul>
          </nav>
          <div className="workspace-account" ref={accountRef}>
            <button
              ref={accountButtonRef}
              type="button"
              className="workspace-account-trigger"
              aria-expanded={isAccountOpen}
              aria-controls="workspace-account-panel"
              aria-label={`Account menu for ${userLabel}`}
              onClick={toggleAccount}
            >
              <span className="workspace-account-avatar" aria-hidden="true">
                {initials}
              </span>
              <span className="workspace-account-meta">
                <span className="workspace-account-name">{userLabel}</span>
              </span>
              <ChevronDown
                className="workspace-account-chevron"
                size={16}
                strokeWidth={1.75}
                absoluteStrokeWidth
                aria-hidden="true"
              />
            </button>
            {isAccountOpen ? (
              <div
                id="workspace-account-panel"
                className="workspace-account-panel"
                role="group"
                aria-label="Account"
              >
                <div className="workspace-account-summary">
                  <span
                    className="workspace-account-avatar workspace-account-avatar-large"
                    aria-hidden="true"
                  >
                    {initials}
                  </span>
                  <div className="workspace-account-summary-copy">
                    <p className="workspace-account-summary-name">{userLabel}</p>
                    {userEmail ? (
                      <p className="workspace-account-summary-email" title={userEmail}>
                        {userEmail}
                      </p>
                    ) : null}
                    {userEmail ? (
                      isEmailVerified ? (
                        <p className="workspace-account-verified">
                          <BadgeCheck
                            size={14}
                            strokeWidth={1.75}
                            absoluteStrokeWidth
                            aria-hidden="true"
                          />
                          Verified email
                        </p>
                      ) : (
                        <p className="workspace-account-unverified">Email not verified</p>
                      )
                    ) : null}
                  </div>
                </div>
                <div className="workspace-account-rule" aria-hidden="true" />
                <Link
                  className="workspace-account-action"
                  href="/profile"
                  onClick={() => setAccountOpen(false)}
                >
                  <CircleUserRound
                    size={16}
                    strokeWidth={1.75}
                    absoluteStrokeWidth
                    aria-hidden="true"
                  />
                  <span>Profile</span>
                </Link>
                <button
                  type="button"
                  className="workspace-account-signout"
                  onClick={handleSignOut}
                >
                  <LogOut
                    size={16}
                    strokeWidth={1.75}
                    absoluteStrokeWidth
                    aria-hidden="true"
                  />
                  <span>Sign out</span>
                </button>
              </div>
            ) : null}
          </div>
          <button
            ref={menuButtonRef}
            type="button"
            className="workspace-menu-button"
            aria-expanded={isMenuOpen}
            aria-controls="workspace-mobile-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <X size={18} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
            ) : (
              <Menu size={18} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
            )}
          </button>
        </div>
        {isMenuOpen ? (
          <nav
            ref={mobileMenuRef}
            id="workspace-mobile-menu"
            className="workspace-mobile-menu"
            aria-label="Primary"
          >
            <ul className="workspace-mobile-menu-list">
              {renderNavLinks("workspace-mobile-nav-link", () => setMenuOpen(false))}
            </ul>
          </nav>
        ) : null}
      </header>
      <main id="workspace-content" className="workspace-content" tabIndex={-1}>
        <div className="workspace-page-header">
          <h1>{title}</h1>
          {page?.description ? <p>{page.description}</p> : null}
        </div>
        {children}
      </main>
    </div>
  );
}
