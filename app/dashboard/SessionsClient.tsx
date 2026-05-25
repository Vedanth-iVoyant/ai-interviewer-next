"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { InterviewSession } from "@/lib/types";

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    evaluated: "var(--pass)",
    in_progress: "var(--warn)",
    completed: "var(--accent)",
    pending: "var(--text-muted)",
  };
  return (
    <span
      style={{
        display: "inline-block",
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: colors[status] ?? "var(--text-muted)",
        marginRight: 6,
        animation: status === "in_progress" ? "pulse 1s infinite" : "none",
      }}
    />
  );
}

function ScoreCell({ value }: { value: number | null }) {
  if (value === null)
    return <span style={{ color: "var(--text-muted)" }}>—</span>;
  const color =
    value >= 7 ? "var(--pass)" : value >= 5 ? "var(--warn)" : "var(--fail)";
  return (
    <span style={{ fontFamily: "var(--mono)", color }}>{value.toFixed(1)}</span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function SessionsClient({
  sessions,
}: {
  sessions: InterviewSession[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "in_progress" | "evaluated" | "completed"
  >("all");
  const [resultFilter, setResultFilter] = useState<"all" | "pass" | "fail">(
    "all",
  );

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      const matchSearch =
        !search ||
        s.candidate_name.toLowerCase().includes(search.toLowerCase()) ||
        s.candidate_email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      const matchResult = resultFilter === "all" || s.result === resultFilter;
      return matchSearch && matchStatus && matchResult;
    });
  }, [sessions, search, statusFilter, resultFilter]);

  const hasFilters = search || statusFilter !== "all" || resultFilter !== "all";

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          marginBottom: "0.75rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            style={{
              width: "100%",
              paddingLeft: 30,
              paddingRight: 12,
              paddingTop: "0.45rem",
              paddingBottom: "0.45rem",
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--text)",
              fontFamily: "var(--font)",
              fontSize: "0.82rem",
              outline: "none",
            }}
          />
        </div>

        {/* Status filter */}
        <div
          style={{
            display: "flex",
            background: "var(--surface2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {(["all", "in_progress", "evaluated"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: "0.4rem 0.75rem",
                border: "none",
                cursor: "pointer",
                fontSize: "0.78rem",
                fontWeight: statusFilter === s ? 600 : 400,
                fontFamily: "var(--font)",
                background:
                  statusFilter === s ? "var(--accent)" : "transparent",
                color: statusFilter === s ? "#fff" : "var(--text-muted)",
                transition: "all 0.15s",
              }}
            >
              {s === "all"
                ? "All"
                : s === "in_progress"
                  ? "Active"
                  : "Evaluated"}
            </button>
          ))}
        </div>

        {/* Result filter */}
        <div
          style={{
            display: "flex",
            background: "var(--surface2)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {(["all", "pass", "fail"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setResultFilter(r)}
              style={{
                padding: "0.4rem 0.75rem",
                border: "none",
                cursor: "pointer",
                fontSize: "0.78rem",
                fontWeight: resultFilter === r ? 600 : 400,
                fontFamily: "var(--font)",
                background:
                  resultFilter === r
                    ? r === "pass"
                      ? "rgba(34,197,94,0.8)"
                      : r === "fail"
                        ? "rgba(239,68,68,0.8)"
                        : "var(--accent)"
                    : "transparent",
                color: resultFilter === r ? "#fff" : "var(--text-muted)",
                transition: "all 0.15s",
              }}
            >
              {r === "all" ? "All Results" : r.toUpperCase()}
            </button>
          ))}
        </div>

        {hasFilters && (
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setResultFilter("all");
            }}
            style={{
              padding: "0.4rem 0.75rem",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontFamily: "var(--font)",
              fontSize: "0.78rem",
            }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Results count */}
      <div
        style={{
          fontSize: "0.78rem",
          color: "var(--text-muted)",
          marginBottom: "0.5rem",
        }}
      >
        Showing {filtered.length} of {sessions.length} sessions
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div
          style={{
            flex: 1,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: "0.9rem",
            padding: "2rem",
          }}
        >
          {sessions.length === 0 ? (
            <>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
                🎤
              </div>
              <p
                style={{
                  fontWeight: 600,
                  color: "var(--text)",
                  marginBottom: "0.4rem",
                  padding: "10px",
                }}
              >
                No sessions yet
              </p>
              <p style={{ fontSize: "0.85rem" }}>
                <Link href="/" style={{ color: "var(--accent)" }}>
                  Start a new interview →
                </Link>
              </p>
            </>
          ) : (
            <>
              <p
                style={{
                  fontWeight: 600,
                  color: "var(--text)",
                  marginBottom: "0.3rem",
                }}
              >
                No matches
              </p>
              <p style={{ fontSize: "0.85rem" }}>Try adjusting your filters.</p>
            </>
          )}
        </div>
      ) : (
        <div
          style={{
            flex: 1,
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
              fontSize: "0.85rem",
              tableLayout: "fixed",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {[
                  "Candidate",
                  "Domain",
                  "Status",
                  "Tech",
                  "Comm",
                  "Overall",
                  "Result",
                  "Date",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "0.7rem 1rem",
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
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td style={{ padding: "0.8rem 1rem" }}>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                      {s.candidate_name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {s.candidate_email}
                    </div>
                  </td>
                  <td style={{ padding: "0.8rem 1rem" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.15rem 0.55rem",
                        borderRadius: 20,
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        fontFamily: "var(--mono)",
                        background: "rgba(59,130,246,0.1)",
                        color: "var(--accent)",
                      }}
                    >
                      {s.domain.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: "0.8rem 1rem" }}>
                    <StatusDot status={s.status} />
                    <span
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {s.status === "in_progress"
                        ? "Active"
                        : s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: "0.8rem 1rem" }}>
                    <ScoreCell value={s.technical_score} />
                  </td>
                  <td style={{ padding: "0.8rem 1rem" }}>
                    <ScoreCell value={s.communication_score} />
                  </td>
                  <td style={{ padding: "0.8rem 1rem" }}>
                    <span
                      style={{ fontFamily: "var(--mono)", fontWeight: 700 }}
                    >
                      <ScoreCell value={s.overall_score} />
                    </span>
                  </td>
                  <td style={{ padding: "0.8rem 1rem" }}>
                    {s.result ? (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.15rem 0.55rem",
                          borderRadius: 20,
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          fontFamily: "var(--mono)",
                          background:
                            s.result === "pass"
                              ? "rgba(34,197,94,0.12)"
                              : "rgba(239,68,68,0.12)",
                          color:
                            s.result === "pass" ? "var(--pass)" : "var(--fail)",
                        }}
                      >
                        {s.result.toUpperCase()}
                      </span>
                    ) : (
                      <span
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.82rem",
                        }}
                      >
                        —
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "0.8rem 1rem",
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatDate(s.created_at)}
                  </td>
                  <td style={{ padding: "0.8rem 1rem" }}>
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
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
