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

export default async function UserAnalysisPage() {
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

  const withTech = evaluated.filter((s) => s.technical_score !== null);
  const withComm = evaluated.filter((s) => s.communication_score !== null);
  const passCount = evaluated.filter((s) => s.result === "pass").length;

  const avgTech =
    withTech.length > 0
      ? withTech.reduce((sum, s) => sum + (s.technical_score ?? 0), 0) /
        withTech.length
      : null;
  const avgComm =
    withComm.length > 0
      ? withComm.reduce((sum, s) => sum + (s.communication_score ?? 0), 0) /
        withComm.length
      : null;
  const passRate =
    evaluated.length > 0
      ? Math.round((passCount / evaluated.length) * 100)
      : null;

  const sortedSessions = [...sessions].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div style={{ padding: "2rem 2.5rem", maxWidth: 1100 }}>
      {/* Header */}
      <div
        style={{
          marginBottom: "1.75rem",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: 700,
              letterSpacing: "-0.5px",
            }}
          >
            My Analysis
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              marginTop: "0.3rem",
              fontSize: "0.9rem",
            }}
          >
            Your performance breakdown across all interview sessions.
          </p>
        </div>
        <Link
          href="/user/dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.45rem 1rem",
            borderRadius: 8,
            fontSize: "0.82rem",
            fontWeight: 600,
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
            textDecoration: "none",
          }}
        >
          ← My Dashboard
        </Link>
      </div>

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
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📊</div>
          <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
            No data yet
          </h3>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.9rem",
              marginBottom: "1.5rem",
            }}
          >
            Complete your first interview to see your analysis here. You&apos;ve
            got this!
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
        <>
          {/* Stat Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            {[
              {
                label: "Avg Technical Score",
                value: avgTech !== null ? avgTech.toFixed(1) : "—",
                sub: `/ 10  ·  ${withTech.length} session${withTech.length !== 1 ? "s" : ""}`,
                color: "var(--accent)",
                bg: "rgba(59,130,246,0.12)",
                barBg: "rgba(59,130,246,0.8)",
                barWidth: avgTech !== null ? `${(avgTech / 10) * 100}%` : "0%",
              },
              {
                label: "Avg Communication Score",
                value: avgComm !== null ? avgComm.toFixed(1) : "—",
                sub: `/ 10  ·  ${withComm.length} session${withComm.length !== 1 ? "s" : ""}`,
                color: "#a855f7",
                bg: "rgba(168,85,247,0.12)",
                barBg: "rgba(168,85,247,0.8)",
                barWidth: avgComm !== null ? `${(avgComm / 10) * 100}%` : "0%",
              },
              {
                label: "Pass Rate",
                value: passRate !== null ? `${passRate}%` : "—",
                sub:
                  evaluated.length > 0
                    ? `${passCount} passed · ${evaluated.length - passCount} failed`
                    : "No evaluated sessions",
                color: "var(--accent2)",
                bg: "rgba(34,197,94,0.12)",
                barBg: "rgba(34,197,94,0.8)",
                barWidth: passRate !== null ? `${passRate}%` : "0%",
              },
            ].map(({ label, value, sub, color, bg, barBg, barWidth }) => (
              <div
                key={label}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "1.25rem",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "0.5rem",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    fontFamily: "var(--mono)",
                    color,
                    lineHeight: 1,
                    marginBottom: "0.35rem",
                  }}
                >
                  {value}
                </div>
                <div
                  style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                >
                  {sub}
                </div>
                <div
                  style={{
                    marginTop: "0.75rem",
                    height: 4,
                    background: "var(--surface2)",
                    borderRadius: 2,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      background: bg.replace("0.12", "0.8"),
                      borderRadius: 2,
                      width: barWidth,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Score History Table */}
          <div>
            <h2
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                marginBottom: "0.75rem",
              }}
            >
              Score History
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
                      "Date",
                      "Domain",
                      "Technical",
                      "Communication",
                      "Overall",
                      "Result",
                      "",
                    ].map((h, i) => (
                      <th
                        key={i}
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
                              display: "inline-block",
                              padding: "0.25rem 0.65rem",
                              borderRadius: 20,
                              fontSize: "0.72rem",
                              fontWeight: 600,
                              background: "rgba(249,115,22,0.1)",
                              color: "var(--warn)",
                            }}
                          >
                            PENDING
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        {s.status === "evaluated" && (
                          <Link
                            href={`/results/${s.id}`}
                            style={{
                              fontSize: "0.78rem",
                              color: "var(--accent)",
                              textDecoration: "none",
                              fontWeight: 600,
                            }}
                          >
                            View →
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
