import Link from "next/link";
import { getSessions } from "@/lib/getSessions";

// ── SVG Chart Components ────────────────────────────────────────────

function DonutChart({ pass, fail }: { pass: number; fail: number }) {
  const total = pass + fail;
  const r = 68;
  const circ = 2 * Math.PI * r; // ≈ 427.3
  const passRate = total > 0 ? pass / total : 0;
  const passArc = circ * passRate;

  return (
    <svg
      viewBox="0 0 200 200"
      width="180"
      height="180"
      style={{ overflow: "visible" }}
    >
      {/* fail ring (background) */}
      <circle
        cx="100"
        cy="100"
        r={r}
        fill="none"
        stroke="rgba(239,68,68,0.2)"
        strokeWidth="22"
      />
      {/* pass arc */}
      {passArc > 0 && (
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="#22c55e"
          strokeWidth="22"
          strokeDasharray={`${passArc} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
        />
      )}
      {/* center */}
      <text
        x="100"
        y="93"
        textAnchor="middle"
        fill="var(--text, #f0f0f5)"
        fontSize="30"
        fontWeight="800"
      >
        {total > 0 ? `${Math.round(passRate * 100)}%` : "—"}
      </text>
      <text
        x="100"
        y="114"
        textAnchor="middle"
        fill="var(--text-muted, #94a3b8)"
        fontSize="11"
      >
        Pass Rate
      </text>
    </svg>
  );
}

function ScoreDistributionChart({
  buckets,
}: {
  buckets: { label: string; count: number; color: string }[];
}) {
  const maxCount = Math.max(...buckets.map((b) => b.count), 1);
  const chartH = 100;
  const barW = 36;
  const gap = 10;
  const svgW = buckets.length * (barW + gap) + 10;

  return (
    <svg
      viewBox={`0 0 ${svgW} ${chartH + 36}`}
      width="100%"
      style={{ overflow: "visible" }}
    >
      {buckets.map((b, i) => {
        const bh = Math.max((b.count / maxCount) * chartH, b.count > 0 ? 4 : 0);
        const x = 5 + i * (barW + gap);
        const y = chartH - bh;
        return (
          <g key={b.label}>
            {/* bar */}
            <rect
              x={x}
              y={y}
              width={barW}
              height={bh}
              fill={b.color}
              rx="4"
              opacity="0.85"
            />
            {/* count label above bar */}
            {b.count > 0 && (
              <text
                x={x + barW / 2}
                y={y - 5}
                textAnchor="middle"
                fill="var(--text, #f0f0f5)"
                fontSize="11"
                fontFamily="var(--mono, monospace)"
              >
                {b.count}
              </text>
            )}
            {/* x-axis label */}
            <text
              x={x + barW / 2}
              y={chartH + 16}
              textAnchor="middle"
              fill="var(--text-muted, #94a3b8)"
              fontSize="10"
            >
              {b.label}
            </text>
          </g>
        );
      })}
      {/* baseline */}
      <line
        x1="0"
        y1={chartH}
        x2={svgW}
        y2={chartH}
        stroke="var(--border, #252535)"
        strokeWidth="1"
      />
    </svg>
  );
}

function WeeklyActivityChart({
  days,
}: {
  days: { day: string; count: number }[];
}) {
  const maxCount = Math.max(...days.map((d) => d.count), 1);
  const barW = 24;
  const gap = 8;
  const chartH = 60;
  const svgW = days.length * (barW + gap);

  return (
    <svg
      viewBox={`0 0 ${svgW} ${chartH + 24}`}
      width="100%"
      style={{ overflow: "visible" }}
    >
      {days.map((d, i) => {
        const bh = Math.max((d.count / maxCount) * chartH, d.count > 0 ? 3 : 0);
        const x = i * (barW + gap);
        const y = chartH - bh;
        return (
          <g key={d.day}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={bh}
              fill={
                d.count > 0 ? "rgba(59,130,246,0.7)" : "var(--border, #252535)"
              }
              rx="3"
            />
            <text
              x={x + barW / 2}
              y={chartH + 14}
              textAnchor="middle"
              fill="var(--text-muted, #94a3b8)"
              fontSize="9"
            >
              {d.day}
            </text>
          </g>
        );
      })}
      <line
        x1="0"
        y1={chartH}
        x2={svgW}
        y2={chartH}
        stroke="var(--border, #252535)"
        strokeWidth="1"
      />
    </svg>
  );
}

function TopicBar({
  topic,
  score,
  candidates,
}: {
  topic: string;
  score: number;
  candidates: number;
}) {
  const pct = (score / 10) * 100;
  const barColor = score >= 7 ? "#22c55e" : score >= 5 ? "#3b82f6" : "#f97316";
  return (
    <div style={{ marginBottom: "1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "0.35rem",
        }}
      >
        <span
          style={{ fontSize: "0.85rem", color: "var(--text)", fontWeight: 500 }}
        >
          {topic}
        </span>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            {candidates} sessions
          </span>
          <span
            style={{
              fontSize: "0.85rem",
              fontFamily: "var(--mono)",
              fontWeight: 700,
              color: barColor,
            }}
          >
            {score.toFixed(1)}
          </span>
        </div>
      </div>
      <div
        style={{
          height: 7,
          background: "var(--surface2)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: barColor,
            borderRadius: 4,
          }}
        />
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────

export default async function AnalyticsPage() {
  const sessions = await getSessions();
  const evaluated = sessions.filter((s) => s.status === "evaluated");
  const passCount = evaluated.filter((s) => s.result === "pass").length;
  const failCount = evaluated.filter((s) => s.result === "fail").length;

  // Compute real averages
  const withTech = sessions.filter((s) => s.technical_score !== null);
  const withComm = sessions.filter((s) => s.communication_score !== null);
  const withOverall = sessions.filter((s) => s.overall_score !== null);

  const avgTech =
    withTech.length > 0
      ? withTech.reduce((s, x) => s + (x.technical_score ?? 0), 0) /
        withTech.length
      : null;
  const avgComm =
    withComm.length > 0
      ? withComm.reduce((s, x) => s + (x.communication_score ?? 0), 0) /
        withComm.length
      : null;
  const avgOverall =
    withOverall.length > 0
      ? withOverall.reduce((s, x) => s + (x.overall_score ?? 0), 0) /
        withOverall.length
      : null;

  // Score distribution buckets from real data (fallback to demo if none)
  const useDemoData = evaluated.length === 0;

  const demoBuckets = [
    { label: "0–2", count: 1, color: "#ef4444" },
    { label: "2–4", count: 2, color: "#f97316" },
    { label: "4–6", count: 5, color: "#eab308" },
    { label: "6–8", count: 9, color: "#3b82f6" },
    { label: "8–10", count: 5, color: "#22c55e" },
  ];

  const realBuckets = (() => {
    const b = [0, 0, 0, 0, 0];
    for (const s of evaluated) {
      const v = s.overall_score ?? 0;
      if (v < 2) b[0]++;
      else if (v < 4) b[1]++;
      else if (v < 6) b[2]++;
      else if (v < 8) b[3]++;
      else b[4]++;
    }
    return [
      { label: "0–2", count: b[0], color: "#ef4444" },
      { label: "2–4", count: b[1], color: "#f97316" },
      { label: "4–6", count: b[2], color: "#eab308" },
      { label: "6–8", count: b[3], color: "#3b82f6" },
      { label: "8–10", count: b[4], color: "#22c55e" },
    ];
  })();

  const scoreBuckets = useDemoData ? demoBuckets : realBuckets;

  // Dummy topic performance (backend has no topic-level analytics endpoint yet)
  const topicStats = [
    { topic: "Java Collections", score: 7.1, candidates: 12 },
    { topic: "Object-Oriented", score: 6.8, candidates: 12 },
    { topic: "Loops & Control", score: 7.9, candidates: 12 },
    { topic: "Spring Beans / DI", score: 5.8, candidates: 12 },
  ];

  // Dummy weekly activity (no time-series API yet)
  const weeklyActivity = [
    { day: "Mon", count: 3 },
    { day: "Tue", count: 5 },
    { day: "Wed", count: 2 },
    { day: "Thu", count: 7 },
    { day: "Fri", count: 4 },
    { day: "Sat", count: 1 },
    { day: "Sun", count: 2 },
  ];

  return (
    <div style={{ padding: "2rem 2rem", maxWidth: 1260 }}>
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
            Analytics
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              marginTop: "0.3rem",
              fontSize: "0.9rem",
            }}
          >
            Performance overview across all interview sessions.
          </p>
        </div>
        <Link
          href="/dashboard"
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
          ← Dashboard
        </Link>
      </div>

      {/* Summary stat cards */}
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
            value:
              avgTech !== null ? avgTech.toFixed(1) : useDemoData ? "6.8" : "—",
            sub: `/ 10  ·  ${withTech.length || (useDemoData ? 22 : 0)} sessions`,
            color: "#3b82f6",
            bg: "rgba(59,130,246,0.12)",
          },
          {
            label: "Avg Communication Score",
            value:
              avgComm !== null ? avgComm.toFixed(1) : useDemoData ? "6.2" : "—",
            sub: `/ 10  ·  ${withComm.length || (useDemoData ? 22 : 0)} sessions`,
            color: "#a855f7",
            bg: "rgba(168,85,247,0.12)",
          },
          {
            label: "Pass Rate",
            value:
              evaluated.length > 0
                ? `${Math.round((passCount / evaluated.length) * 100)}%`
                : useDemoData
                  ? "64%"
                  : "—",
            sub:
              evaluated.length > 0
                ? `${passCount} passed · ${failCount} failed`
                : useDemoData
                  ? "14 passed · 8 failed"
                  : "No evaluated sessions",
            color: "#22c55e",
            bg: "rgba(34,197,94,0.12)",
          },
        ].map(({ label, value, sub, color, bg }) => (
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
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
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
                  width:
                    typeof value === "string" && value.endsWith("%")
                      ? value
                      : `${((parseFloat(value as string) || 0) / 10) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Charts — two-column */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.25rem",
          marginBottom: "1.25rem",
        }}
      >
        {/* Pass/Fail Donut */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "1.4rem",
          }}
        >
          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700 }}>
              Pass / Fail Ratio
            </h3>
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                marginTop: "0.2rem",
              }}
            >
              Distribution of evaluated interview outcomes
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2rem",
              flexWrap: "wrap",
            }}
          >
            <DonutChart
              pass={evaluated.length > 0 ? passCount : 14}
              fail={evaluated.length > 0 ? failCount : 8}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {[
                {
                  label: "Passed",
                  count: evaluated.length > 0 ? passCount : 14,
                  color: "#22c55e",
                  bg: "rgba(34,197,94,0.12)",
                },
                {
                  label: "Failed",
                  count: evaluated.length > 0 ? failCount : 8,
                  color: "#ef4444",
                  bg: "rgba(239,68,68,0.12)",
                },
                {
                  label: "Total",
                  count: evaluated.length > 0 ? evaluated.length : 22,
                  color: "var(--text-muted)",
                  bg: "var(--surface2)",
                },
              ].map(({ label, count, color, bg }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      padding: "0.1rem 0.5rem",
                      borderRadius: 20,
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      fontFamily: "var(--mono)",
                      background: bg,
                      color,
                    }}
                  >
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Score Distribution */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "1.4rem",
          }}
        >
          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700 }}>
              Score Distribution
            </h3>
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                marginTop: "0.2rem",
              }}
            >
              Overall score spread across candidates
            </p>
          </div>
          <ScoreDistributionChart buckets={scoreBuckets} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "0.5rem",
              fontSize: "0.72rem",
              color: "var(--text-muted)",
            }}
          >
            <span>Score range (out of 10)</span>
            <span>
              {scoreBuckets.reduce((s, b) => s + b.count, 0)} candidates
            </span>
          </div>
        </div>
      </div>

      {/* Second row: Topic Performance + Weekly Activity */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.25rem",
        }}
      >
        {/* Topic Performance */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "1.4rem",
          }}
        >
          <div style={{ marginBottom: "1.1rem" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700 }}>
              Topic Performance
            </h3>
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                marginTop: "0.2rem",
              }}
            >
              Avg score per topic across all sessions
            </p>
          </div>
          {topicStats.map((t) => (
            <TopicBar
              key={t.topic}
              topic={t.topic}
              score={t.score}
              candidates={t.candidates}
            />
          ))}
        </div>

        {/* Weekly Activity + Domain Breakdown */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {/* Weekly Activity */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "1.4rem",
            }}
          >
            <div style={{ marginBottom: "0.9rem" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700 }}>
                Weekly Activity
              </h3>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  marginTop: "0.2rem",
                }}
              >
                Interviews conducted per day
              </p>
            </div>
            <WeeklyActivityChart days={weeklyActivity} />
          </div>

          {/* Domain Breakdown */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "1.4rem",
            }}
          >
            <h3
              style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                marginBottom: "0.9rem",
              }}
            >
              Domain Breakdown
            </h3>
            {sessions.length === 0 ? (
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-muted)",
                  textAlign: "center",
                  padding: "1rem 0",
                }}
              >
                No sessions yet
              </p>
            ) : (
              (() => {
                const domainMap: Record<string, number> = {};
                for (const s of sessions)
                  domainMap[s.domain] = (domainMap[s.domain] ?? 0) + 1;
                return Object.entries(domainMap).map(([domain, count]) => {
                  const pct = Math.round((count / sessions.length) * 100);
                  return (
                    <div key={domain} style={{ marginBottom: "0.8rem" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.82rem",
                          marginBottom: "0.3rem",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 500,
                            textTransform: "capitalize",
                          }}
                        >
                          {domain}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {count} sessions · {pct}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: 6,
                          background: "var(--surface2)",
                          borderRadius: 3,
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: "var(--accent)",
                            borderRadius: 3,
                          }}
                        />
                      </div>
                    </div>
                  );
                });
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
