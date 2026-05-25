import Link from 'next/link';
import type { InterviewSession } from '@/lib/types';

const DJANGO_URL = process.env.DJANGO_URL ?? 'http://localhost:8000';

async function getSessions(): Promise<InterviewSession[]> {
  try {
    const res = await fetch(`${DJANGO_URL}/api/sessions/`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColor(name: string) {
  const colors = [
    'rgba(59,130,246,0.2)', 'rgba(34,197,94,0.2)', 'rgba(249,115,22,0.2)',
    'rgba(168,85,247,0.2)', 'rgba(236,72,153,0.2)', 'rgba(20,184,166,0.2)',
  ];
  let h = 0;
  for (const c of name) h = (h + c.charCodeAt(0)) % colors.length;
  return colors[h];
}

function getAvatarTextColor(name: string) {
  const colors = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ec4899', '#14b8a6'];
  let h = 0;
  for (const c of name) h = (h + c.charCodeAt(0)) % colors.length;
  return colors[h];
}

interface CandidatePipeline {
  email: string;
  name: string;
  domain: string;
  latestSession: InterviewSession | null;
  pipelineStage: 'not_started' | 'in_progress' | 'screening_pass' | 'screening_fail';
  overallScore: number | null;
}

export default async function PipelinePage() {
  const sessions = await getSessions();

  // Group sessions by candidate email, pick latest session per candidate
  const candidateMap = new Map<string, CandidatePipeline>();

  for (const s of sessions) {
    const key = s.candidate_email.toLowerCase();
    if (!candidateMap.has(key)) {
      candidateMap.set(key, {
        email: s.candidate_email,
        name: s.candidate_name,
        domain: s.domain,
        latestSession: s,
        pipelineStage: 'not_started',
        overallScore: null,
      });
    }
    const c = candidateMap.get(key)!;
    // Keep most recent session
    if (s.created_at > (c.latestSession?.created_at ?? '')) {
      c.latestSession = s;
      c.domain = s.domain;
    }
  }

  // Determine pipeline stage per candidate
  for (const c of candidateMap.values()) {
    const s = c.latestSession;
    if (!s) {
      c.pipelineStage = 'not_started';
    } else if (s.status === 'evaluated' && s.result === 'pass') {
      c.pipelineStage = 'screening_pass';
      c.overallScore = s.overall_score;
    } else if (s.status === 'evaluated' && s.result === 'fail') {
      c.pipelineStage = 'screening_fail';
      c.overallScore = s.overall_score;
    } else if (s.status === 'in_progress') {
      c.pipelineStage = 'in_progress';
    } else {
      c.pipelineStage = 'not_started';
    }
  }

  const candidates = Array.from(candidateMap.values()).sort((a, b) => {
    // Sort: screening_pass first, then in_progress, then not_started, then fail
    const order = { screening_pass: 0, in_progress: 1, not_started: 2, screening_fail: 3 };
    return order[a.pipelineStage] - order[b.pipelineStage];
  });

  const totalInPipeline = candidates.length;
  const atScreening = candidates.filter(c => c.pipelineStage === 'not_started' || c.pipelineStage === 'in_progress').length;
  const passedScreening = candidates.filter(c => c.pipelineStage === 'screening_pass').length;
  const rejected = candidates.filter(c => c.pipelineStage === 'screening_fail').length;

  function stageProgress(stage: CandidatePipeline['pipelineStage']): number {
    if (stage === 'screening_pass') return 2;
    if (stage === 'in_progress') return 1;
    if (stage === 'not_started') return 0;
    return 0; // fail
  }

  function overallStatusBadge(stage: CandidatePipeline['pipelineStage']) {
    switch (stage) {
      case 'not_started':
        return { label: 'Screening', bg: 'var(--surface2)', color: 'var(--text-muted)' };
      case 'in_progress':
        return { label: 'Screening', bg: 'rgba(249,115,22,0.1)', color: 'var(--warn)' };
      case 'screening_pass':
        return { label: 'Advanced', bg: 'rgba(34,197,94,0.1)', color: 'var(--pass)' };
      case 'screening_fail':
        return { label: 'Rejected', bg: 'rgba(239,68,68,0.1)', color: 'var(--fail)' };
    }
  }

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.5px' }}>Interview Pipeline</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem', fontSize: '0.9rem' }}>
            Track candidates through the intern selection process.
          </p>
        </div>
        <Link href="/candidates" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.45rem 1rem', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600,
          border: '1px solid var(--border)', color: 'var(--text-muted)', textDecoration: 'none',
        }}>
          All Candidates →
        </Link>
      </div>

      {/* Summary bar */}
      <div style={{
        display: 'flex', gap: '2rem', alignItems: 'center',
        padding: '0.9rem 1.2rem',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 10, marginBottom: '1.75rem', flexWrap: 'wrap',
      }}>
        {[
          { label: 'Total in pipeline', value: totalInPipeline, color: 'var(--text)' },
          { label: 'At Screening', value: atScreening, color: 'var(--warn)' },
          { label: 'Passed Screening', value: passedScreening, color: 'var(--pass)' },
          { label: 'Rejected', value: rejected, color: 'var(--fail)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color, fontFamily: 'var(--mono)' }}>{value}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Pipeline stages header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gap: '0.75rem', marginBottom: '1.25rem',
      }}>
        {[
          { stage: 'AI Screening', icon: '🤖', color: 'var(--accent)' },
          { stage: 'Technical 1', icon: '💻', color: '#a855f7' },
          { stage: 'Technical 2', icon: '🔬', color: '#f97316' },
          { stage: 'HR Interview', icon: '🤝', color: '#22c55e' },
        ].map(({ stage, icon, color }) => (
          <div key={stage} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '0.8rem 1rem',
            display: 'flex', alignItems: 'center', gap: '0.6rem',
          }}>
            <span style={{ fontSize: '1.1rem' }}>{icon}</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color }}>{stage}</span>
          </div>
        ))}
      </div>

      {/* Candidate table */}
      {candidates.length === 0 ? (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '4rem 2rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚀</div>
          <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No candidates yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Start interviews to populate the pipeline.
          </p>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 1.4rem', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600,
            background: 'var(--accent)', color: '#fff', textDecoration: 'none',
          }}>
            Start First Interview →
          </Link>
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Candidate', 'Domain', 'AI Screening', 'Tech Round 1', 'Tech Round 2', 'HR Interview', 'Status', 'Progress', 'Actions'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.68rem',
                    color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
                    fontWeight: 600, whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {candidates.map(c => {
                const initials = getInitials(c.name);
                const bgColor = getAvatarColor(c.name);
                const textColor = getAvatarTextColor(c.name);
                const badge = overallStatusBadge(c.pipelineStage);
                const progress = stageProgress(c.pipelineStage);
                // 4 dots: AI Screening, Tech1, Tech2, HR
                const dots = [
                  c.pipelineStage !== 'not_started',
                  c.pipelineStage === 'screening_pass',
                  false,
                  false,
                ];

                return (
                  <tr key={c.email} style={{ borderBottom: '1px solid var(--border)' }}>
                    {/* Candidate */}
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                          background: bgColor,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 700, color: textColor,
                        }}>
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Domain */}
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.55rem', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600,
                        fontFamily: 'var(--mono)', background: 'rgba(59,130,246,0.1)', color: 'var(--accent)',
                      }}>
                        {c.domain.toUpperCase()}
                      </span>
                    </td>

                    {/* AI Screening */}
                    <td style={{ padding: '0.9rem 1rem' }}>
                      {c.pipelineStage === 'not_started' && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Not started</span>
                      )}
                      {c.pipelineStage === 'in_progress' && (
                        <span style={{
                          display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 20,
                          fontSize: '0.72rem', fontWeight: 600,
                          background: 'rgba(249,115,22,0.1)', color: 'var(--warn)',
                        }}>
                          In Progress
                        </span>
                      )}
                      {(c.pipelineStage === 'screening_pass' || c.pipelineStage === 'screening_fail') && c.overallScore !== null && (
                        <span style={{
                          display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 20,
                          fontSize: '0.72rem', fontWeight: 700, fontFamily: 'var(--mono)',
                          background: c.pipelineStage === 'screening_pass' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                          color: c.pipelineStage === 'screening_pass' ? 'var(--pass)' : 'var(--fail)',
                        }}>
                          {c.overallScore.toFixed(1)}/10
                        </span>
                      )}
                    </td>

                    {/* Tech Round 1 */}
                    <td style={{ padding: '0.9rem 1rem' }}>
                      {c.pipelineStage === 'screening_pass' ? (
                        <span style={{
                          display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 20,
                          fontSize: '0.72rem', fontWeight: 600,
                          background: 'var(--surface2)', color: 'var(--text-muted)',
                        }}>
                          Scheduled
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                      )}
                    </td>

                    {/* Tech Round 2 */}
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                    </td>

                    {/* HR Interview */}
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                    </td>

                    {/* Overall Status */}
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span style={{
                        display: 'inline-block', padding: '0.25rem 0.65rem', borderRadius: 20,
                        fontSize: '0.72rem', fontWeight: 700,
                        background: badge.bg, color: badge.color,
                      }}>
                        {badge.label}
                      </span>
                    </td>

                    {/* Progress dots */}
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                        {dots.map((filled, i) => (
                          <div key={i} style={{
                            width: 10, height: 10, borderRadius: '50%',
                            background: filled
                              ? (c.pipelineStage === 'screening_fail' && i === 0 ? 'var(--fail)' : 'var(--accent)')
                              : 'var(--border)',
                            border: `1.5px solid ${filled ? (c.pipelineStage === 'screening_fail' && i === 0 ? 'var(--fail)' : 'var(--accent)') : 'var(--border)'}`,
                            flexShrink: 0,
                          }} />
                        ))}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.9rem 1rem' }}>
                      {c.latestSession && (c.pipelineStage === 'screening_pass' || c.pipelineStage === 'screening_fail') && (
                        <Link href={`/results/${c.latestSession.id}`} style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          padding: '0.3rem 0.8rem', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600,
                          background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                          color: 'var(--accent)', textDecoration: 'none', whiteSpace: 'nowrap',
                        }}>
                          View Results
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
