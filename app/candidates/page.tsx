import Link from "next/link";
import { getSessions } from "@/lib/getSessions";
import CandidatesClient, { type CandidateProfile } from "./CandidatesClient";

export default async function CandidatesPage() {
  const sessions = await getSessions();

  const candidateMap = new Map<string, CandidateProfile>();
  for (const s of sessions) {
    const key = s.candidate_email.toLowerCase();
    if (!candidateMap.has(key)) {
      candidateMap.set(key, {
        email: s.candidate_email,
        name: s.candidate_name,
        sessions: [],
        bestScore: null,
        latestResult: null,
        lastInterviewed: s.created_at,
        domains: [],
      });
    }
    const c = candidateMap.get(key)!;
    c.sessions.push(s);
    if (
      s.overall_score !== null &&
      (c.bestScore === null || s.overall_score > c.bestScore)
    ) {
      c.bestScore = s.overall_score;
    }
    if (s.result) c.latestResult = s.result;
    if (s.created_at > c.lastInterviewed) c.lastInterviewed = s.created_at;
    if (!c.domains.includes(s.domain)) c.domains.push(s.domain);
  }

  const candidates = Array.from(candidateMap.values()).sort(
    (a, b) =>
      new Date(b.lastInterviewed).getTime() -
      new Date(a.lastInterviewed).getTime(),
  );

  const bestCandidateEmail = candidates.reduce<string | null>((best, c) => {
    if (c.bestScore === null) return best;
    if (best === null) return c.email;
    const bestScore = candidates.find((x) => x.email === best)?.bestScore ?? 0;
    return c.bestScore > bestScore ? c.email : best;
  }, null);

  const passedCount = candidates.filter(
    (c) => c.latestResult === "pass",
  ).length;
  const failedCount = candidates.filter(
    (c) => c.latestResult === "fail",
  ).length;
  const pendingCount = candidates.filter((c) => c.latestResult === null).length;

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
            Candidates
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              marginTop: "0.3rem",
              fontSize: "0.9rem",
            }}
          >
            All interviewed candidates and their session history.
          </p>
        </div>
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
            label: "Total candidates",
            value: candidates.length,
            color: "var(--text)",
          },
          { label: "Passed", value: passedCount, color: "var(--pass)" },
          { label: "Failed", value: failedCount, color: "var(--fail)" },
          { label: "Pending", value: pendingCount, color: "var(--text-muted)" },
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

      {candidates.length === 0 ? (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "4rem 2rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>👤</div>
          <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
            No candidates yet
          </h3>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.9rem",
              marginBottom: "1.5rem",
            }}
          >
            Candidates will appear here after their first interview.
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
            Schedule First Interview →
          </Link>
        </div>
      ) : (
        <CandidatesClient
          candidates={candidates}
          bestCandidateEmail={bestCandidateEmail}
        />
      )}
    </div>
  );
}
