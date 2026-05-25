import Link from "next/link";
import SessionsClient from "./SessionsClient";
import { getSessions } from "@/lib/getSessions";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string) {
  const colors = [
    "rgba(59,130,246,0.2)",
    "rgba(34,197,94,0.2)",
    "rgba(249,115,22,0.2)",
    "rgba(168,85,247,0.2)",
  ];
  let h = 0;
  for (const c of name) h = (h + c.charCodeAt(0)) % colors.length;
  return colors[h];
}
function getAvatarText(name: string) {
  const colors = ["#3b82f6", "#22c55e", "#f97316", "#a855f7"];
  let h = 0;
  for (const c of name) h = (h + c.charCodeAt(0)) % colors.length;
  return colors[h];
}

function StatCard({
  value,
  label,
  sub,
  subColor,
  iconBg,
  icon,
}: {
  value: string | number;
  label: string;
  sub?: string;
  subColor?: string;
  iconBg: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "1.25rem",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "0.75rem",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "0.78rem",
            color: "var(--text-muted)",
            marginBottom: "0.45rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "1.9rem",
            fontWeight: 800,
            lineHeight: 1,
            color: "var(--text)",
            fontFamily: "var(--mono)",
          }}
        >
          {value}
        </div>
        {sub && (
          <div
            style={{
              fontSize: "0.75rem",
              marginTop: "0.4rem",
              color: subColor ?? "var(--text-muted)",
              fontWeight: 500,
            }}
          >
            {sub}
          </div>
        )}
      </div>
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const sessions = await getSessions();

  const evaluatedCount = sessions.filter(
    (s) => s.status === "evaluated",
  ).length;
  const inProgressCount = sessions.filter(
    (s) => s.status === "in_progress",
  ).length;
  const passCount = sessions.filter((s) => s.result === "pass").length;
  const passRate =
    evaluatedCount > 0 ? Math.round((passCount / evaluatedCount) * 100) : 0;

  const topPerformers = sessions
    .filter((s) => s.overall_score !== null)
    .sort((a, b) => (b.overall_score ?? 0) - (a.overall_score ?? 0))
    .slice(0, 5);

  const avgTechnical =
    sessions.filter((s) => s.technical_score !== null).length > 0
      ? sessions.reduce((sum, s) => sum + (s.technical_score ?? 0), 0) /
        sessions.filter((s) => s.technical_score !== null).length
      : null;
  const avgOverall =
    sessions.filter((s) => s.overall_score !== null).length > 0
      ? sessions.reduce((sum, s) => sum + (s.overall_score ?? 0), 0) /
        sessions.filter((s) => s.overall_score !== null).length
      : null;

  return (
    <div style={{ padding: "2rem 2rem", maxWidth: 1260 }}>
      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1
          style={{
            fontSize: "1.6rem",
            fontWeight: 700,
            letterSpacing: "-0.5px",
          }}
        >
          Welcome back, Interviewer!
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            marginTop: "0.3rem",
            fontSize: "0.9rem",
          }}
        >
          Here&apos;s a summary of your candidates and their interview progress.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <StatCard
          value={sessions.length}
          label="Total Sessions"
          sub={sessions.length > 0 ? "All time" : "No sessions yet"}
          subColor="var(--text-muted)"
          iconBg="rgba(59,130,246,0.12)"
          icon={
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
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatCard
          value={inProgressCount}
          label="In Progress"
          sub={inProgressCount > 0 ? "Active now" : "None active"}
          subColor={inProgressCount > 0 ? "var(--warn)" : "var(--text-muted)"}
          iconBg="rgba(249,115,22,0.12)"
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--warn)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <StatCard
          value={evaluatedCount}
          label="Evaluated"
          sub={
            evaluatedCount > 0
              ? `${passCount} passed · ${evaluatedCount - passCount} failed`
              : "None yet"
          }
          subColor={evaluatedCount > 0 ? "var(--accent2)" : "var(--text-muted)"}
          iconBg="rgba(34,197,94,0.12)"
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent2)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          }
        />
        <StatCard
          value={evaluatedCount > 0 ? `${passRate}%` : "—"}
          label="Pass Rate"
          sub={
            evaluatedCount > 0
              ? `${passCount} of ${evaluatedCount} passed`
              : "No data yet"
          }
          subColor={
            passRate >= 60
              ? "var(--accent2)"
              : passRate > 0
                ? "var(--warn)"
                : "var(--text-muted)"
          }
          iconBg={
            passRate >= 60 ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)"
          }
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={passRate >= 60 ? "var(--accent2)" : "var(--fail)"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
              <line x1="2" y1="20" x2="22" y2="20" />
            </svg>
          }
        />
      </div>

      {/* Two-column layout */}
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "stretch" }}>
        {/* Left: Sessions table with filter */}
        <div
          style={{
            flex: "1 1 0",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.75rem",
            }}
          >
            <h2 style={{ fontSize: "0.95rem", fontWeight: 700 }}>
              Interview Sessions
            </h2>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Link
                href="/analytics"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.4rem 0.9rem",
                  borderRadius: 7,
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                  textDecoration: "none",
                }}
              >
                View Analytics
              </Link>
              <Link
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.4rem 0.9rem",
                  borderRadius: 7,
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  background: "var(--accent)",
                  color: "#fff",
                  textDecoration: "none",
                }}
              >
                + New Interview
              </Link>
            </div>
          </div>
          <SessionsClient sessions={sessions} />
        </div>

        {/* Right: Quick insights */}
        <div
          style={{
            width: 260,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {/* Top Performers */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "1.1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.9rem",
              }}
            >
              <h3 style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                Top Performers
              </h3>
              <Link
                href="/review-queue"
                style={{
                  fontSize: "0.72rem",
                  color: "var(--accent)",
                  textDecoration: "none",
                }}
              >
                View all →
              </Link>
            </div>
            {topPerformers.length === 0 ? (
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-muted)",
                  textAlign: "center",
                  padding: "1rem 0",
                }}
              >
                No evaluated sessions yet
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.65rem",
                }}
              >
                {topPerformers.map((s, i) => (
                  <Link
                    key={s.id}
                    href={`/results/${s.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.7rem",
                      textDecoration: "none",
                      padding: "0.4rem",
                      borderRadius: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontFamily: "var(--mono)",
                        color: "var(--text-muted)",
                        minWidth: 16,
                        textAlign: "center",
                      }}
                    >
                      {i + 1}
                    </span>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: getAvatarColor(s.candidate_name),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: getAvatarText(s.candidate_name),
                      }}
                    >
                      {getInitials(s.candidate_name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          color: "var(--text)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.candidate_name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.68rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {s.domain.toUpperCase()}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: 700,
                          fontFamily: "var(--mono)",
                          color:
                            (s.overall_score ?? 0) >= 7
                              ? "var(--pass)"
                              : "var(--warn)",
                        }}
                      >
                        {s.overall_score?.toFixed(1)}
                      </div>
                      <div
                        style={{
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          color:
                            s.result === "pass" ? "var(--pass)" : "var(--fail)",
                        }}
                      >
                        {s.result?.toUpperCase()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Score Summary */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "1.1rem",
            }}
          >
            <h3
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                marginBottom: "0.9rem",
              }}
            >
              Score Overview
            </h3>
            {avgOverall === null ? (
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-muted)",
                  textAlign: "center",
                  padding: "0.75rem 0",
                }}
              >
                Complete an interview to see averages
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {[
                  {
                    label: "Avg Technical",
                    value: avgTechnical,
                    color: "var(--accent)",
                  },
                  {
                    label: "Avg Overall",
                    value: avgOverall,
                    color: "var(--accent2)",
                  },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.78rem",
                        marginBottom: "0.3rem",
                      }}
                    >
                      <span style={{ color: "var(--text-muted)" }}>
                        {label}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontWeight: 600,
                          color,
                        }}
                      >
                        {value?.toFixed(1)}/10
                      </span>
                    </div>
                    <div
                      style={{
                        height: 5,
                        background: "var(--surface2)",
                        borderRadius: 3,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 3,
                          background: color,
                          width: `${((value ?? 0) / 10) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "1.1rem",
            }}
          >
            <h3
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                marginBottom: "0.75rem",
              }}
            >
              Quick Actions
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}
            >
              {[
                { label: "Start New Interview", href: "/", icon: "🎤" },
                {
                  label: "View Review Queue",
                  href: "/review-queue",
                  icon: "📋",
                },
                {
                  label: "Analytics & Reports",
                  href: "/analytics",
                  icon: "📊",
                },
              ].map(({ label, href, icon }) => (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.5rem 0.6rem",
                    borderRadius: 7,
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    color: "var(--text-muted)",
                    textDecoration: "none",
                    border: "1px solid var(--border)",
                    background: "var(--surface2)",
                  }}
                >
                  <span>{icon}</span>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
