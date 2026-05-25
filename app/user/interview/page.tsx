"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DOMAIN_TOPICS, DOMAIN_ICONS } from "@/lib/constants";
import type { StoredSessionInfo } from "@/lib/types";

export default function UserInterviewPage() {
  const router = useRouter();
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("java");
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    DOMAIN_TOPICS["java"] ?? [],
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const match = document.cookie.match(/(?:^|;\s*)tg_user=([^;]+)/);
      if (match) {
        const parsed = JSON.parse(decodeURIComponent(match[1]));
        if (parsed.name) setCandidateName(parsed.name);
        if (parsed.email) setCandidateEmail(parsed.email);
      }
    } catch {
      // ignore
    }
  }, []);

  const domains = Object.keys(DOMAIN_TOPICS);

  function handleDomainSelect(domain: string) {
    setSelectedDomain(domain);
    setSelectedTopics(DOMAIN_TOPICS[domain] ?? []);
  }

  function toggleTopic(topic: string) {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );
  }

  async function handleStart() {
    setError("");
    if (!candidateName.trim()) {
      setError("Candidate name is missing from your profile.");
      return;
    }
    if (!candidateEmail.trim()) {
      setError("Candidate email is missing from your profile.");
      return;
    }
    if (selectedTopics.length === 0) {
      setError("Please select at least one topic.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/proxy/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_name: candidateName,
          candidate_email: candidateEmail,
          domain: selectedDomain,
          topics: selectedTopics,
        }),
      });
      const data = await res.json();
      if (data.session_id) {
        const sessionInfo: StoredSessionInfo = {
          id: data.session_id,
          candidate_name: candidateName,
          candidate_email: candidateEmail,
          domain: selectedDomain,
          topics: selectedTopics,
        };
        localStorage.setItem(
          `session_${data.session_id}`,
          JSON.stringify(sessionInfo),
        );
        router.push(`/interview/${data.session_id}`);
      } else {
        setError(data.error ?? "Failed to start session.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  const currentTopics = DOMAIN_TOPICS[selectedDomain] ?? [];

  return (
    <div style={{ padding: "2rem 2.5rem", maxWidth: 1100 }}>
      {/* Page Header */}
      <div
        style={{
          marginBottom: "2rem",
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
            Take Interview
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              marginTop: "0.3rem",
              fontSize: "0.9rem",
            }}
          >
            Select your domain and topics to begin your AI-powered interview.
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

      {error && (
        <div
          style={{
            padding: "0.75rem 1rem",
            borderRadius: 8,
            fontSize: "0.875rem",
            marginBottom: "1.25rem",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "var(--fail)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* Two-column layout */}
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
        {/* Left column */}
        <div
          style={{
            flex: "1 1 0",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {/* Candidate Info (read-only) */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                marginBottom: "1.25rem",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(59,130,246,0.12)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: "0.95rem", fontWeight: 700 }}>
                  Your Profile
                </h2>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    marginTop: "0.05rem",
                  }}
                >
                  Interview will be recorded under these details
                </p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                padding: "0.9rem 1rem",
                background: "rgba(59,130,246,0.04)",
                border: "1px solid rgba(59,130,246,0.12)",
                borderRadius: 8,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "0.3rem",
                    fontWeight: 600,
                  }}
                >
                  Full Name
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "var(--text)",
                  }}
                >
                  {candidateName || "—"}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "0.3rem",
                    fontWeight: 600,
                  }}
                >
                  Email Address
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "var(--text)",
                    wordBreak: "break-all",
                  }}
                >
                  {candidateEmail || "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Domain Selection */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                marginBottom: "1.25rem",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(168,85,247,0.12)",
                  border: "1px solid rgba(168,85,247,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: "0.95rem", fontWeight: 700 }}>
                  Interview Domain
                </h2>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    marginTop: "0.05rem",
                  }}
                >
                  Choose the technical area to be evaluated in
                </p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                gap: "0.7rem",
              }}
            >
              {domains.map((domain) => (
                <button
                  key={domain}
                  onClick={() => handleDomainSelect(domain)}
                  style={{
                    padding: "0.85rem 0.75rem",
                    borderRadius: 10,
                    cursor: "pointer",
                    border: `1.5px solid ${selectedDomain === domain ? "var(--accent)" : "var(--border)"}`,
                    background:
                      selectedDomain === domain
                        ? "rgba(59,130,246,0.08)"
                        : "var(--surface2)",
                    fontFamily: "var(--font)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color:
                      selectedDomain === domain
                        ? "var(--accent)"
                        : "var(--text-muted)",
                    transition: "all 0.15s",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.4rem",
                      display: "block",
                      marginBottom: "0.35rem",
                    }}
                  >
                    {DOMAIN_ICONS[domain] ?? "💻"}
                  </span>
                  {domain.charAt(0).toUpperCase() + domain.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Topics */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.25rem",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "rgba(34,197,94,0.12)",
                    border: "1px solid rgba(34,197,94,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--accent2)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  </svg>
                </div>
                <div>
                  <h2 style={{ fontSize: "0.95rem", fontWeight: 700 }}>
                    Interview Topics
                  </h2>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      marginTop: "0.05rem",
                    }}
                  >
                    {selectedTopics.length} of {currentTopics.length} selected
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button
                  onClick={() => setSelectedTopics(currentTopics)}
                  style={{
                    padding: "0.3rem 0.7rem",
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    fontFamily: "var(--font)",
                    fontSize: "0.75rem",
                  }}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedTopics([])}
                  style={{
                    padding: "0.3rem 0.7rem",
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    fontFamily: "var(--font)",
                    fontSize: "0.75rem",
                  }}
                >
                  None
                </button>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "0.5rem",
              }}
            >
              {currentTopics.map((topic) => {
                const checked = selectedTopics.includes(topic);
                return (
                  <label
                    key={topic}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.65rem",
                      padding: "0.6rem 0.9rem",
                      borderRadius: 8,
                      cursor: "pointer",
                      border: `1px solid ${checked ? "rgba(34,197,94,0.4)" : "var(--border)"}`,
                      background: checked
                        ? "rgba(34,197,94,0.06)"
                        : "var(--surface2)",
                      transition: "all 0.15s",
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        flexShrink: 0,
                        border: `1.5px solid ${checked ? "var(--accent2)" : "var(--border)"}`,
                        background: checked ? "var(--accent2)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s",
                      }}
                    >
                      {checked && (
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <polyline
                            points="2,6 5,9 10,3"
                            stroke="#fff"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTopic(topic)}
                      style={{ display: "none" }}
                    />
                    <span
                      style={{
                        fontSize: "0.855rem",
                        color: checked ? "var(--text)" : "var(--text-muted)",
                        userSelect: "none",
                        fontWeight: checked ? 500 : 400,
                      }}
                    >
                      {topic.charAt(0).toUpperCase() + topic.slice(1)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div
          style={{
            width: 280,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            position: "sticky",
            top: "1.5rem",
          }}
        >
          {/* Session Summary */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "1.25rem",
            }}
          >
            <h3
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                marginBottom: "1rem",
              }}
            >
              Session Overview
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.7rem",
                marginBottom: "1.25rem",
              }}
            >
              {[
                {
                  label: "Domain",
                  value:
                    selectedDomain.charAt(0).toUpperCase() +
                    selectedDomain.slice(1),
                  icon: DOMAIN_ICONS[selectedDomain] ?? "💻",
                },
                {
                  label: "Topics",
                  value: `${selectedTopics.length} selected`,
                  icon: "📋",
                },
                { label: "Questions", value: "~8 questions", icon: "❓" },
                { label: "Duration", value: "~20 minutes", icon: "⏱" },
                { label: "Format", value: "Voice + Text", icon: "🎤" },
              ].map(({ label, value, icon }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "0.82rem",
                  }}
                >
                  <span
                    style={{
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <span style={{ fontSize: "0.85rem" }}>{icon}</span>
                    {label}
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: "var(--text)",
                      fontFamily:
                        label === "Topics" ||
                        label === "Questions" ||
                        label === "Duration"
                          ? "var(--mono)"
                          : "var(--font)",
                      fontSize: "0.8rem",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "1rem",
              }}
            >
              {candidateName && (
                <div
                  style={{
                    padding: "0.6rem 0.8rem",
                    borderRadius: 8,
                    marginBottom: "0.75rem",
                    background: "rgba(59,130,246,0.06)",
                    border: "1px solid rgba(59,130,246,0.15)",
                    fontSize: "0.8rem",
                  }}
                >
                  <div style={{ fontWeight: 600, color: "var(--text)" }}>
                    {candidateName}
                  </div>
                  {candidateEmail && (
                    <div
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.75rem",
                        marginTop: "0.1rem",
                      }}
                    >
                      {candidateEmail}
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={handleStart}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.7rem 1rem",
                  borderRadius: 8,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  background: "var(--accent)",
                  color: "#fff",
                  fontFamily: "var(--font)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  opacity: loading ? 0.7 : 1,
                  transition: "opacity 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                {loading ? (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      style={{ animation: "spin 1s linear infinite" }}
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Creating session…
                  </>
                ) : (
                  "Begin Interview →"
                )}
              </button>
            </div>
          </div>

          {/* How it works */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "1.25rem",
            }}
          >
            <h3
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                marginBottom: "0.9rem",
              }}
            >
              How it works
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {[
                {
                  step: "1",
                  label: "Choose domain",
                  desc: "Select the technical area and topics",
                },
                {
                  step: "2",
                  label: "Voice interview",
                  desc: "AI asks questions, you respond",
                },
                {
                  step: "3",
                  label: "AI evaluates",
                  desc: "Automatic scoring on all answers",
                },
                {
                  step: "4",
                  label: "View report",
                  desc: "Detailed result with pass/fail verdict",
                },
              ].map(({ step, label, desc }) => (
                <div
                  key={step}
                  style={{
                    display: "flex",
                    gap: "0.7rem",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: "rgba(59,130,246,0.12)",
                      border: "1px solid rgba(59,130,246,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: "var(--accent)",
                      fontFamily: "var(--mono)",
                    }}
                  >
                    {step}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "var(--text)",
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-muted)",
                        marginTop: "0.1rem",
                      }}
                    >
                      {desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                marginBottom: "0.65rem",
              }}
            >
              Quick Links
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
              }}
            >
              {[
                { href: "/user/dashboard", label: "My Dashboard" },
                { href: "/user/analysis", label: "My Analysis" },
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--accent)",
                    textDecoration: "none",
                    padding: "0.3rem 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
