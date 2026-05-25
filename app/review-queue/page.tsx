import Link from "next/link";
import { getSessions } from "@/lib/getSessions";
import ReviewQueueClient from "./ReviewQueueClient";

export default async function ReviewQueuePage() {
  const allSessions = await getSessions();
  const evaluated = allSessions.filter((s) => s.status === "evaluated");

  const urgentCount = evaluated.filter((s) => {
    const ms = Date.now() - new Date(s.completed_at ?? s.created_at).getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24)) > 3;
  }).length;

  const bestSessionId = evaluated.reduce<number | null>((best, s) => {
    if (s.overall_score === null) return best;
    if (best === null) return s.id;
    const bestScore = evaluated.find((x) => x.id === best)?.overall_score ?? 0;
    return s.overall_score > bestScore ? s.id : best;
  }, null);

  return (
    <div style={{ padding: "2rem 2rem", maxWidth: 1260 }}>
      {/* Header */}
      <div
        style={{
          marginBottom: "1.5rem",
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
            Review Queue
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              marginTop: "0.3rem",
              fontSize: "0.9rem",
            }}
          >
            Evaluated interview sessions ready for your review.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {urgentCount > 0 && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.35rem 0.8rem",
                borderRadius: 20,
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "var(--danger)",
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              ⚠ {urgentCount} need attention
            </span>
          )}
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.5rem 1.1rem",
              borderRadius: 8,
              fontSize: "0.82rem",
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

      {/* Summary bar */}
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          alignItems: "center",
          padding: "0.9rem 1.2rem",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        {[
          {
            label: "Total evaluated",
            value: evaluated.length,
            color: "var(--text)",
          },
          {
            label: "Passed",
            value: evaluated.filter((s) => s.result === "pass").length,
            color: "var(--pass)",
          },
          {
            label: "Failed",
            value: evaluated.filter((s) => s.result === "fail").length,
            color: "var(--fail)",
          },
          {
            label: "Needs attention",
            value: urgentCount,
            color: "var(--warn)",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <span
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color,
                fontFamily: "var(--mono)",
              }}
            >
              {value}
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <ReviewQueueClient sessions={evaluated} bestSessionId={bestSessionId} />
    </div>
  );
}
