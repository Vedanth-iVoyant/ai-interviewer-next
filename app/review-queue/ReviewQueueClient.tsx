"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import type { InterviewSession } from "@/lib/types";

const DOMAIN_LABELS: Record<string, string> = {
  java: "Java",
  python: "Python",
  react: "React",
  ai_ml: "AI / ML",
  devops: "DevOps",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
function getAvatarBg(name: string) {
  const c = [
    "rgba(59,130,246,0.25)",
    "rgba(34,197,94,0.25)",
    "rgba(249,115,22,0.25)",
    "rgba(168,85,247,0.25)",
    "rgba(236,72,153,0.25)",
    "rgba(20,184,166,0.25)",
  ];
  let h = 0;
  for (const ch of name) h = (h + ch.charCodeAt(0)) % c.length;
  return c[h];
}
function getAvatarText(name: string) {
  const c = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ec4899", "#14b8a6"];
  let h = 0;
  for (const ch of name) h = (h + ch.charCodeAt(0)) % c.length;
  return c[h];
}
function daysSince(dateStr: string) {
  return Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24),
  );
}
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const ctrlStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--text)",
  padding: "0.45rem 0.9rem",
  fontSize: "0.82rem",
  outline: "none",
  cursor: "pointer",
};

export default function ReviewQueueClient({
  sessions,
  bestSessionId,
}: {
  sessions: InterviewSession[];
  bestSessionId: number | null;
}) {
  const [domain, setDomain] = useState("all");
  const [result, setResult] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");

  const allDomains = useMemo(
    () => Array.from(new Set(sessions.map((s) => s.domain))).sort(),
    [sessions],
  );

  const filtered = useMemo(() => {
    const resultList = sessions.filter((s) => {
      if (domain !== "all" && s.domain !== domain) return false;
      if (result !== "all" && s.result !== result) return false;
      if (
        ageFilter === "urgent" &&
        daysSince(s.completed_at ?? s.created_at) <= 3
      )
        return false;
      if (
        ageFilter === "recent" &&
        daysSince(s.completed_at ?? s.created_at) > 3
      )
        return false;
      return true;
    });

    // ✅ Move best performer to top
    return resultList.sort((a, b) => {
      if (a.id === bestSessionId) return -1;
      if (b.id === bestSessionId) return 1;
      return 0;
    });
  }, [sessions, domain, result, ageFilter, bestSessionId]);

  const hasFilters =
    domain !== "all" || result !== "all" || ageFilter !== "all";

  if (sessions.length === 0) {
    return (
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "4rem 2rem",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📋</div>
        <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
          No evaluated sessions yet
        </h3>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.9rem",
            marginBottom: "1.5rem",
          }}
        >
          Complete and evaluate an interview to see results here.
        </p>
        <Link
          href="/"
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
          Start First Interview →
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          gap: "0.6rem",
          alignItems: "center",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
        }}
      >
        <select
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          style={ctrlStyle}
        >
          <option value="all">All Domains</option>
          {allDomains.map((d) => (
            <option key={d} value={d}>
              {DOMAIN_LABELS[d] ?? d.toUpperCase()}
            </option>
          ))}
        </select>
        <select
          value={result}
          onChange={(e) => setResult(e.target.value)}
          style={ctrlStyle}
        >
          <option value="all">All Results</option>
          <option value="pass">Passed</option>
          <option value="fail">Failed</option>
        </select>
        <select
          value={ageFilter}
          onChange={(e) => setAgeFilter(e.target.value)}
          style={ctrlStyle}
        >
          <option value="all">Any Age</option>
          <option value="urgent">Needs Attention (&gt;3 days)</option>
          <option value="recent">Recent (≤3 days)</option>
        </select>
        {hasFilters && (
          <button
            onClick={() => {
              setDomain("all");
              setResult("all");
              setAgeFilter("all");
            }}
            style={{ ...ctrlStyle, color: "var(--text-muted)" }}
          >
            Clear
          </button>
        )}
        <span
          style={{
            marginLeft: "auto",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            whiteSpace: "nowrap",
          }}
        >
          {filtered.length} / {sessions.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "3rem 2rem",
            textAlign: "center",
          }}
        >
          <p style={{ color: "var(--text-muted)" }}>
            No sessions match the current filters.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1rem",
          }}
        >
          {filtered.map((session) => {
            const age = daysSince(session.completed_at ?? session.created_at);
            const isUrgent = age > 3;
            const isBest =
              bestSessionId !== null && session.id === bestSessionId;

            return (
              <div
                key={session.id}
                style={{
                  background: "var(--surface)",
                  border: `1px solid ${isBest ? "rgba(34,197,94,0.4)" : isUrgent ? "rgba(239,68,68,0.3)" : "var(--border)"}`,
                  borderRadius: 12,
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  position: "relative",
                }}
              >
                {/* Best performer ribbon */}
                {isBest && (
                  <div
                    style={{
                      position: "absolute",
                      top: -1,
                      right: 16,
                      padding: "0.2rem 0.7rem",
                      borderRadius: "0 0 8px 8px",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      background: "var(--pass)",
                      color: "#fff",
                      letterSpacing: "0.06em",
                    }}
                  >
                    🏆 BEST PERFORMER
                  </div>
                )}

                {/* Top: avatar + name */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.9rem",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: isBest
                        ? "rgba(34,197,94,0.25)"
                        : getAvatarBg(session.candidate_name),
                      border: isBest
                        ? "2px solid rgba(34,197,94,0.5)"
                        : undefined,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      color: isBest
                        ? "#22c55e"
                        : getAvatarText(session.candidate_name),
                    }}
                  >
                    {getInitials(session.candidate_name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                        {session.candidate_name}
                      </span>
                      {isUrgent && !isBest && (
                        <span
                          style={{
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            padding: "0.15rem 0.5rem",
                            borderRadius: 20,
                            background: "var(--danger)",
                            color: "#fff",
                            letterSpacing: "0.05em",
                          }}
                        >
                          URGENT
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: "0.76rem",
                        color: "var(--text-muted)",
                        marginTop: "0.1rem",
                      }}
                    >
                      {session.candidate_email}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div
                  style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}
                >
                  <span
                    style={{
                      padding: "0.2rem 0.55rem",
                      borderRadius: 20,
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      background: "rgba(59,130,246,0.1)",
                      color: "var(--accent)",
                      fontFamily: "var(--mono)",
                    }}
                  >
                    {session.domain.toUpperCase()}
                  </span>
                  <span
                    style={{
                      padding: "0.2rem 0.55rem",
                      borderRadius: 20,
                      fontSize: "0.7rem",
                      background: "var(--surface2)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {session.topics.slice(0, 2).join(", ")}
                    {session.topics.length > 2
                      ? ` +${session.topics.length - 2}`
                      : ""}
                  </span>
                  <span
                    style={{
                      padding: "0.2rem 0.55rem",
                      borderRadius: 20,
                      fontSize: "0.7rem",
                      background: "var(--surface2)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {age === 0
                      ? "Today"
                      : age === 1
                        ? "Yesterday"
                        : `${age}d ago`}
                  </span>
                </div>

                {/* Scores */}
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    padding: "0.7rem 0.9rem",
                    background: "var(--surface2)",
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                >
                  {[
                    { label: "Technical", val: session.technical_score },
                    { label: "Comm.", val: session.communication_score },
                    { label: "Overall", val: session.overall_score },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ flex: 1, textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: "1rem",
                          fontWeight: 700,
                          fontFamily: "var(--mono)",
                          color: "var(--text)",
                        }}
                      >
                        {val !== null ? val.toFixed(1) : "—"}
                      </div>
                      <div
                        style={{
                          fontSize: "0.65rem",
                          color: "var(--text-muted)",
                          marginTop: "0.1rem",
                        }}
                      >
                        {label}
                      </div>
                    </div>
                  ))}
                  <div
                    style={{
                      width: 1,
                      height: 32,
                      background: "var(--border)",
                      margin: "0 0.2rem",
                    }}
                  />
                  <div style={{ textAlign: "center", minWidth: 48 }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.25rem 0.55rem",
                        borderRadius: 20,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        fontFamily: "var(--mono)",
                        background:
                          session.result === "pass"
                            ? "rgba(34,197,94,0.15)"
                            : "rgba(239,68,68,0.15)",
                        color:
                          session.result === "pass"
                            ? "var(--pass)"
                            : "var(--fail)",
                      }}
                    >
                      {session.result?.toUpperCase() ?? "—"}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}
                  >
                    {formatDate(session.completed_at ?? session.created_at)}
                  </span>
                  <Link
                    href={`/results/${session.id}`}
                    style={{
                      padding: "0.4rem 1rem",
                      borderRadius: 7,
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      background: isBest ? "var(--pass)" : "var(--accent)",
                      color: "#fff",
                      textDecoration: "none",
                    }}
                  >
                    Review →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
