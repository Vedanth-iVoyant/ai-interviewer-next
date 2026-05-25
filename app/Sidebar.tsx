"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function GridIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  );
}

function PipelineIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="5" cy="6" r="2" />
      <circle cx="12" cy="6" r="2" />
      <circle cx="19" cy="6" r="2" />
      <line x1="5" y1="8" x2="5" y2="22" />
      <line x1="12" y1="8" x2="12" y2="22" />
      <line x1="19" y1="8" x2="19" y2="22" />
      <line x1="3" y1="14" x2="7" y2="14" />
      <line x1="10" y1="17" x2="14" y2="17" />
      <line x1="17" y1="12" x2="21" y2="12" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function TalentGateIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

const mainNav = [
  { href: "/dashboard", label: "Dashboard", Icon: GridIcon },
  { href: "/", label: "New Interview", Icon: MicIcon },
  { href: "/candidates", label: "Candidates", Icon: UsersIcon },
  { href: "/review-queue", label: "Review Queue", Icon: ClipboardIcon },
  { href: "/analytics", label: "Analytics", Icon: BarChartIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string, label: string) {
    if (label === "New Interview") return pathname === "/";
    if (label === "Candidates") return pathname.startsWith("/candidates");
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: "var(--sidebar-width)",
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: "1.5rem 1.25rem",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 9,
            background: "rgba(59,130,246,0.12)",
            border: "1px solid rgba(59,130,246,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <TalentGateIcon />
        </div>
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: "0.95rem",
              letterSpacing: "-0.3px",
              color: "var(--text)",
            }}
          >
            Talent<span style={{ color: "var(--accent)" }}>Gate</span>
          </div>
          <div
            style={{
              fontSize: "0.72rem",
              color: "var(--text-muted)",
              marginTop: "0.05rem",
            }}
          >
            AI Interviewer
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav
        style={{
          flex: 1,
          padding: "1rem 0.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.1rem",
          overflowY: "auto",
        }}
      >
        {mainNav.map(({ href, label, Icon }) => {
          const active = isActive(href, label);
          return (
            <Link
              key={label}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.6rem 0.8rem",
                borderRadius: 8,
                fontSize: "0.875rem",
                fontWeight: active ? 600 : 400,
                color: active ? "var(--accent)" : "var(--text-muted)",
                background: active ? "rgba(59,130,246,0.1)" : "transparent",
                transition: "background 0.15s, color 0.15s",
                textDecoration: "none",
              }}
            >
              <span
                style={{ flexShrink: 0, display: "flex", color: "inherit" }}
              >
                <Icon />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "0.75rem", borderTop: "1px solid var(--border)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.6rem 0.8rem",
            borderRadius: 8,
            fontSize: "0.875rem",
            color: "var(--text-muted)",
            cursor: "pointer",
          }}
        >
          <span style={{ display: "flex", flexShrink: 0 }}>
            <SettingsIcon />
          </span>
          Settings
        </div>
      </div>
    </aside>
  );
}
