import { cookies } from "next/headers";
import Link from "next/link";
import type { InterviewSession } from "@/lib/types";

const DJANGO_URL = process.env.DJANGO_URL ?? "http://localhost:8000";

async function getSessions(): Promise<InterviewSession[]> {
  try {
    const res = await fetch(`${DJANGO_URL}/api/sessions/`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

export default async function UserDashboardPage() {
  const cookieStore = await cookies();
  const userStr = cookieStore.get("tg_user")?.value;
  let user: { name: string; email: string } | null = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch {}

  const allSessions = await getSessions();
  const sessions = user
    ? allSessions.filter(
        (s) => s.candidate_email.toLowerCase() === user!.email.toLowerCase(),
      )
    : [];

  const evaluated = sessions.filter((s) => s.status === "evaluated");
  const bestScore = sessions.reduce(
    (max, s) =>
      s.overall_score !== null && s.overall_score > max ? s.overall_score : max,
    -Infinity,
  );
  const hasBest = bestScore > -Infinity;

  const latestEvaluated = evaluated.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0];

  const sortedSessions = [...sessions].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div style={{ padding: "2rem 2.5rem", maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1
          style={{
            fontSize: "1.6rem",
            fontWeight: 700,
            letterSpacing: "-0.5px",
          }}
        >
          Welcome back, {user?.name ?? "Candidate"}!
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            marginTop: "0.3rem",
            fontSize: "0.9rem",
          }}
        >
          {"Here's your interview history."}
        </p>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <StatCard
          value={sessions.length}
          label="Total Interviews"
          sub={
            sessions.length === 1
              ? "1 session taken"
              : `${sessions.length} sessions taken`
          }
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
              <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="8" y1="22" x2="16" y2="22" />
            </svg>
          }
        />
        <StatCard
          value={hasBest ? bestScore.toFixed(1) : "—"}
          label="Best Score"
          sub={hasBest ? `out of 10.0` : "No evaluated sessions yet"}
          subColor={
            hasBest
              ? bestScore >= 7
                ? "var(--pass)"
                : bestScore >= 5
                  ? "var(--warn)"
                  : "var(--fail)"
              : undefined
          }
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
          value={
            latestEvaluated
              ? (latestEvaluated.result?.toUpperCase() ?? "—")
              : "—"
          }
          label="Last Result"
          sub={
            latestEvaluated
              ? formatDate(latestEvaluated.created_at)
              : "No results yet"
          }
          subColor={
            latestEvaluated?.result === "pass"
              ? "var(--pass)"
              : latestEvaluated?.result === "fail"
                ? "var(--fail)"
                : undefined
          }
          iconBg={
            latestEvaluated?.result === "pass"
              ? "rgba(34,197,94,0.12)"
              : latestEvaluated?.result === "fail"
                ? "rgba(239,68,68,0.12)"
                : "rgba(100,116,139,0.12)"
          }
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={
                latestEvaluated?.result === "pass"
                  ? "var(--pass)"
                  : latestEvaluated?.result === "fail"
                    ? "var(--fail)"
                    : "var(--text-muted)"
              }
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {latestEvaluated?.result === "pass" ? (
                <polyline points="20 6 9 17 4 12" />
              ) : latestEvaluated?.result === "fail" ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <circle cx="12" cy="12" r="10" />
              )}
            </svg>
          }
        />
      </div>

      {/* Sessions table */}
      {sessions.length === 0 ? (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "4rem 2rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🎤</div>
          <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
            No interviews yet
          </h3>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.9rem",
              marginBottom: "1.5rem",
            }}
          >
            {"You haven't taken any interviews yet."}
          </p>
          <Link
            href="/user/interview"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 1.4rem",
              borderRadius: 8,
              fontSize: "0.9rem",
              fontWeight: 600,
              background: "var(--accent)",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            Take Your First Interview →
          </Link>
        </div>
      ) : (
        <div>
          <h2
            style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
            }}
          >
            Interview History
          </h2>
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.875rem",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {[
                    "Domain",
                    "Status",
                    "Technical",
                    "Communication",
                    "Overall",
                    "Result",
                    "Date",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "0.75rem 1rem",
                        fontSize: "0.7rem",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        fontWeight: 600,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedSessions.map((s) => (
                  <tr
                    key={s.id}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <span
                        style={{
                          padding: "0.2rem 0.6rem",
                          borderRadius: 20,
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          fontFamily: "var(--mono)",
                          background: "rgba(59,130,246,0.1)",
                          color: "var(--accent)",
                        }}
                      >
                        {s.domain.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <span
                        style={{
                          padding: "0.2rem 0.6rem",
                          borderRadius: 20,
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          background:
                            s.status === "evaluated"
                              ? "rgba(34,197,94,0.1)"
                              : s.status === "in_progress"
                                ? "rgba(249,115,22,0.1)"
                                : "var(--surface2)",
                          color:
                            s.status === "evaluated"
                              ? "var(--pass)"
                              : s.status === "in_progress"
                                ? "var(--warn)"
                                : "var(--text-muted)",
                        }}
                      >
                        {s.status.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "0.85rem 1rem",
                        fontFamily: "var(--mono)",
                        fontWeight: 700,
                        color:
                          s.technical_score !== null
                            ? s.technical_score >= 7
                              ? "var(--pass)"
                              : s.technical_score >= 5
                                ? "var(--warn)"
                                : "var(--fail)"
                            : "var(--text-muted)",
                      }}
                    >
                      {s.technical_score !== null
                        ? s.technical_score.toFixed(1)
                        : "—"}
                    </td>
                    <td
                      style={{
                        padding: "0.85rem 1rem",
                        fontFamily: "var(--mono)",
                        fontWeight: 700,
                        color:
                          s.communication_score !== null
                            ? s.communication_score >= 7
                              ? "var(--pass)"
                              : s.communication_score >= 5
                                ? "var(--warn)"
                                : "var(--fail)"
                            : "var(--text-muted)",
                      }}
                    >
                      {s.communication_score !== null
                        ? s.communication_score.toFixed(1)
                        : "—"}
                    </td>
                    <td
                      style={{
                        padding: "0.85rem 1rem",
                        fontFamily: "var(--mono)",
                        fontWeight: 700,
                        color:
                          s.overall_score !== null
                            ? s.overall_score >= 7
                              ? "var(--pass)"
                              : s.overall_score >= 5
                                ? "var(--warn)"
                                : "var(--fail)"
                            : "var(--text-muted)",
                      }}
                    >
                      {s.overall_score !== null
                        ? s.overall_score.toFixed(1)
                        : "—"}
                    </td>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      {s.result ? (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.25rem 0.65rem",
                            borderRadius: 20,
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            fontFamily: "var(--mono)",
                            background:
                              s.result === "pass"
                                ? "rgba(34,197,94,0.12)"
                                : "rgba(239,68,68,0.12)",
                            color:
                              s.result === "pass"
                                ? "var(--pass)"
                                : "var(--fail)",
                          }}
                        >
                          {s.result.toUpperCase()}
                        </span>
                      ) : (
                        <span
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "0.85rem",
                          }}
                        >
                          —
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "0.85rem 1rem",
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {formatDate(s.created_at)}
                    </td>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      {s.status === "evaluated" && (
                        <Link
                          href={`/results/${s.id}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            padding: "0.3rem 0.8rem",
                            borderRadius: 6,
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            background: "rgba(59,130,246,0.1)",
                            border: "1px solid rgba(59,130,246,0.2)",
                            color: "var(--accent)",
                            textDecoration: "none",
                          }}
                        >
                          View
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
