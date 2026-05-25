'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { InterviewSession } from '@/lib/types';

export interface CandidateProfile {
  email: string;
  name: string;
  sessions: InterviewSession[];
  bestScore: number | null;
  latestResult: 'pass' | 'fail' | null;
  lastInterviewed: string;
  domains: string[];
}

const DOMAIN_LABELS: Record<string, string> = {
  java: 'Java', python: 'Python', react: 'React', ai_ml: 'AI / ML', devops: 'DevOps',
};

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
function getAvatarColor(name: string) {
  const c = ['rgba(59,130,246,0.2)', 'rgba(34,197,94,0.2)', 'rgba(249,115,22,0.2)', 'rgba(168,85,247,0.2)', 'rgba(236,72,153,0.2)', 'rgba(20,184,166,0.2)'];
  let h = 0; for (const ch of name) h = (h + ch.charCodeAt(0)) % c.length; return c[h];
}
function getAvatarText(name: string) {
  const c = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ec4899', '#14b8a6'];
  let h = 0; for (const ch of name) h = (h + ch.charCodeAt(0)) % c.length; return c[h];
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const ctrlStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--text)',
  padding: '0.45rem 0.9rem',
  fontSize: '0.82rem',
  outline: 'none',
  cursor: 'pointer',
};

export default function CandidatesClient({
  candidates,
  bestCandidateEmail,
}: {
  candidates: CandidateProfile[];
  bestCandidateEmail: string | null;
}) {
  const [domain, setDomain] = useState('all');
  const [result, setResult] = useState('all');
  const [search, setSearch] = useState('');

  const allDomains = useMemo(() => {
    const s = new Set<string>();
    candidates.forEach(c => c.domains.forEach(d => s.add(d)));
    return Array.from(s).sort();
  }, [candidates]);

  const filtered = useMemo(() => candidates.filter(c => {
    if (domain !== 'all' && !c.domains.includes(domain)) return false;
    if (result === 'pending' && c.latestResult !== null) return false;
    if (result !== 'all' && result !== 'pending' && c.latestResult !== result) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [candidates, domain, result, search]);

  const hasFilters = domain !== 'all' || result !== 'all' || search.trim() !== '';

  return (
    <>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...ctrlStyle, flex: '1 1 200px', minWidth: 160 }}
        />
        <select value={domain} onChange={e => setDomain(e.target.value)} style={ctrlStyle}>
          <option value="all">All Domains</option>
          {allDomains.map(d => <option key={d} value={d}>{DOMAIN_LABELS[d] ?? d.toUpperCase()}</option>)}
        </select>
        <select value={result} onChange={e => setResult(e.target.value)} style={ctrlStyle}>
          <option value="all">All Results</option>
          <option value="pass">Passed</option>
          <option value="fail">Failed</option>
          <option value="pending">Pending</option>
        </select>
        {hasFilters && (
          <button onClick={() => { setDomain('all'); setResult('all'); setSearch(''); }} style={{ ...ctrlStyle, color: 'var(--text-muted)' }}>
            Clear
          </button>
        )}
        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {filtered.length} / {candidates.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '3rem 2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No candidates match the current filters.</p>
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Candidate', 'Sessions', 'Domains', 'Best Score', 'Result', 'Last Interviewed', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const isBest = bestCandidateEmail !== null && c.email.toLowerCase() === bestCandidateEmail.toLowerCase();
                const latestSession = [...c.sessions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

                return (
                  <tr key={c.email} style={{ borderBottom: '1px solid var(--border)', background: isBest ? 'rgba(34,197,94,0.04)' : undefined }}>
                    {/* Candidate */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: isBest ? 'rgba(34,197,94,0.2)' : getAvatarColor(c.name),
                          border: isBest ? '2px solid rgba(34,197,94,0.5)' : undefined,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.78rem', fontWeight: 700, color: isBest ? '#22c55e' : getAvatarText(c.name),
                        }}>
                          {getInitials(c.name)}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{c.name}</span>
                            {isBest && (
                              <span style={{
                                padding: '0.1rem 0.45rem', borderRadius: 20, fontSize: '0.62rem', fontWeight: 700,
                                background: 'rgba(34,197,94,0.15)', color: 'var(--pass)',
                                border: '1px solid rgba(34,197,94,0.3)', letterSpacing: '0.04em', whiteSpace: 'nowrap',
                              }}>
                                🏆 TOP PICK
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{c.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Sessions */}
                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      <span style={{ padding: '0.2rem 0.55rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--mono)', background: 'var(--surface2)', color: 'var(--text-muted)' }}>
                        {c.sessions.length}×
                      </span>
                    </td>

                    {/* Domains */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {c.domains.map(d => (
                          <span key={d} style={{ padding: '0.15rem 0.5rem', borderRadius: 20, fontSize: '0.68rem', fontWeight: 600, fontFamily: 'var(--mono)', background: 'rgba(59,130,246,0.1)', color: 'var(--accent)', whiteSpace: 'nowrap' }}>
                            {d.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Best Score */}
                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      {c.bestScore !== null ? (
                        <span style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--mono)', color: c.bestScore >= 7 ? 'var(--pass)' : c.bestScore >= 5 ? 'var(--warn)' : 'var(--fail)' }}>
                          {c.bestScore.toFixed(1)}<span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>/10</span>
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                      )}
                    </td>

                    {/* Result */}
                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      {c.latestResult ? (
                        <span style={{ padding: '0.25rem 0.65rem', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, fontFamily: 'var(--mono)', background: c.latestResult === 'pass' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: c.latestResult === 'pass' ? 'var(--pass)' : 'var(--fail)' }}>
                          {c.latestResult.toUpperCase()}
                        </span>
                      ) : (
                        <span style={{ padding: '0.25rem 0.65rem', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, background: 'rgba(249,115,22,0.1)', color: 'var(--warn)' }}>
                          PENDING
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDate(c.lastInterviewed)}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {latestSession && (
                          <Link href={`/results/${latestSession.id}`} style={{ padding: '0.3rem 0.75rem', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: 'var(--accent)', textDecoration: 'none' }}>
                            View
                          </Link>
                        )}
                        <Link href="/" style={{ padding: '0.3rem 0.75rem', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600, border: '1px solid var(--border)', color: 'var(--text-muted)', textDecoration: 'none' }}>
                          Re-interview
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
