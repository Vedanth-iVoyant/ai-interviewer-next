import Link from 'next/link';
import type { SessionDetail, InterviewQuestion } from '@/lib/types';
import { getMockDetail } from '@/lib/getMockDetail';

const DJANGO_URL = process.env.DJANGO_URL ?? 'http://localhost:8000';

async function getSessionDetail(sessionId: number): Promise<SessionDetail | null> {
  try {
    const res = await fetch(`${DJANGO_URL}/api/sessions/${sessionId}/`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return getMockDetail(sessionId);
    return res.json();
  } catch {
    return getMockDetail(sessionId);
  }
}

function ProgressBar({ value, max = 10 }: { value: number; max?: number }) {
  return (
    <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden', marginTop: '0.4rem' }}>
      <div style={{
        height: '100%', borderRadius: 3, transition: 'width 0.5s',
        background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
        width: `${(value / max) * 100}%`,
      }} />
    </div>
  );
}

function ScoreCard({ value, label }: { value: number | null; label: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', textAlign: 'center' }}>
      <div style={{
        fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--mono)',
        background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        {value !== null ? value.toFixed(1) : '—'}
        <span style={{ fontSize: '1rem', color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)' }}>/10</span>
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{label}</div>
      <ProgressBar value={value ?? 0} />
    </div>
  );
}

function QAItem({ q }: { q: InterviewQuestion }) {
  const scoreColor = (q.technical_accuracy ?? 0) >= 7 ? 'var(--pass)' : (q.technical_accuracy ?? 0) >= 4 ? 'var(--warn)' : 'var(--fail)';
  const diffColors = { easy: 'rgba(34,197,94,0.15)', medium: 'rgba(249,115,22,0.15)', hard: 'rgba(239,68,68,0.15)' };
  const diffText = { easy: 'var(--accent2)', medium: 'var(--warn)', hard: 'var(--danger)' };

  return (
    <details style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <summary style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '1rem 1.2rem', cursor: 'pointer', listStyle: 'none',
      }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--text-muted)', minWidth: 30 }}>Q{q.question_number}</span>
        <span style={{ flex: 1, fontSize: '0.9rem' }}>{q.question_text.slice(0, 80)}{q.question_text.length > 80 ? '…' : ''}</span>
        <span style={{
          display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--mono)',
          background: diffColors[q.difficulty], color: diffText[q.difficulty],
        }}>{q.difficulty}</span>
        <span style={{
          display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--mono)',
          background: 'var(--surface2)', color: 'var(--text-muted)',
        }}>{q.topic}</span>
        {q.technical_accuracy !== null ? (
          <span style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem', fontWeight: 700, minWidth: 50, textAlign: 'right', color: scoreColor }}>
            {q.technical_accuracy.toFixed(1)}/10
          </span>
        ) : <span style={{ color: 'var(--text-muted)', minWidth: 50, textAlign: 'right', fontSize: '0.85rem' }}>N/A</span>}
        <span style={{ color: 'var(--text-muted)' }}>▼</span>
      </summary>

      <div style={{ padding: '0 1.2rem 1.2rem', borderTop: '1px solid var(--border)' }}>
        <Section title="Question"><p style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>{q.question_text}</p></Section>
        <Section title="Candidate's Answer">
          <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {q.answer_text ?? <em>No answer provided.</em>}
          </p>
        </Section>
        {q.answer_feedback && (
          <Section title="AI Feedback"><p style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>{q.answer_feedback}</p></Section>
        )}
        {q.key_points_covered.length > 0 && (
          <Section title="Key Points Covered">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
              {q.key_points_covered.map((p, i) => (
                <span key={i} style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--accent2)', padding: '0.2rem 0.6rem', borderRadius: 4, fontSize: '0.78rem' }}>
                  ✓ {p}
                </span>
              ))}
            </div>
          </Section>
        )}
        {q.key_points_missed.length > 0 && (
          <Section title="Key Points Missed">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
              {q.key_points_missed.map((p, i) => (
                <span key={i} style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--fail)', padding: '0.2rem 0.6rem', borderRadius: 4, fontSize: '0.78rem' }}>
                  ✗ {p}
                </span>
              ))}
            </div>
          </Section>
        )}
      </div>
    </details>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: '1rem' }}>
      <h4 style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>{title}</h4>
      {children}
    </div>
  );
}

function SoftSkillBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <span>{label}</span>
        <span style={{ fontFamily: 'var(--mono)', color: 'var(--text)' }}>{value.toFixed(1)}/10</span>
      </div>
      <ProgressBar value={value} />
    </div>
  );
}

export default async function ResultsPage(props: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await props.params;
  const id = parseInt(sessionId, 10);
  const session = await getSessionDetail(id);

  if (!session) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Results Unavailable</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Django needs to expose <code style={{ fontFamily: 'var(--mono)', color: 'var(--accent)' }}>GET /api/sessions/{'{id}'}/</code> as a JSON endpoint to display results.
        </p>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.6rem 1.4rem', borderRadius: 8,
          fontFamily: 'var(--font)', fontSize: '0.9rem', fontWeight: 600,
          background: 'var(--accent)', color: '#fff', border: 'none',
        }}>
          Start New Interview
        </Link>
      </div>
    );
  }

  const report = session.report;
  const softSkills = session.soft_skills;

  return (
    <>
      {/* Results header */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '2.5rem 0', marginBottom: '2.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-1px' }}>Interview Results</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
              {session.candidate_name} &nbsp;·&nbsp; {session.domain.toUpperCase()} &nbsp;·&nbsp;
              {new Date(session.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>{session.candidate_email}</p>
          </div>

          {session.result ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '1.2rem 2rem', borderRadius: 12,
              border: `2px solid ${session.result === 'pass' ? 'var(--pass)' : 'var(--fail)'}`,
              background: session.result === 'pass' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: session.result === 'pass' ? 'var(--pass)' : 'var(--fail)' }}>
                {session.result === 'pass' ? '✅ PASS' : '❌ FAIL'}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem', marginTop: '0.3rem', color: 'var(--text-muted)' }}>
                Overall: {session.overall_score?.toFixed(1) ?? '—'} / 10
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.2rem 2rem', borderRadius: 12, border: '2px solid var(--border)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                EVALUATING…
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fade-in" style={{ maxWidth: 900, margin: '0 auto', padding: '0 1rem 3rem' }}>

        {/* Score cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <ScoreCard value={session.technical_score} label="Technical Score" />
          <ScoreCard value={session.communication_score} label="Communication Score" />
          <ScoreCard value={session.overall_score} label="Overall Score" />
        </div>

        {/* AI Summary */}
        {report && (
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
              📋 AI Evaluation Summary
            </h2>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-muted)' }}>{report.summary}</p>
            {report.recommendation && (
              <div style={{ marginTop: '1rem', padding: '0.8rem 1rem', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, fontSize: '0.9rem' }}>
                💡 <strong>Recommendation:</strong> {report.recommendation}
              </div>
            )}
          </div>
        )}

        {/* Soft Skills */}
        {softSkills && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
              🗣️ Communication & Soft Skills
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem', marginBottom: '1.5rem' }}>
              <SoftSkillBar label="Communication Clarity" value={softSkills.communication_clarity} />
              <SoftSkillBar label="Vocabulary Richness" value={softSkills.vocabulary_richness} />
              <SoftSkillBar label="Answer Structure" value={softSkills.answer_structure} />
              <SoftSkillBar label="Confidence Level" value={softSkills.confidence_level} />
              <SoftSkillBar label="Conciseness" value={softSkills.conciseness} />
              <SoftSkillBar label="Overall Communication" value={softSkills.overall_communication} />
            </div>
            {softSkills.communication_feedback && (
              <div style={{ background: 'var(--surface2)', borderLeft: '3px solid var(--accent)', padding: '1rem 1.2rem', borderRadius: '0 8px 8px 0', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                {softSkills.communication_feedback}
              </div>
            )}
            {softSkills.strengths.length > 0 && (
              <div style={{ marginBottom: '0.8rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>STRENGTHS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {softSkills.strengths.map((s, i) => (
                    <span key={i} style={{ padding: '0.25rem 0.7rem', borderRadius: 20, fontSize: '0.78rem', background: 'rgba(34,197,94,0.1)', color: 'var(--accent2)', border: '1px solid rgba(34,197,94,0.2)' }}>
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {softSkills.improvements.length > 0 && (
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>AREAS TO IMPROVE</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {softSkills.improvements.map((imp, i) => (
                    <span key={i} style={{ padding: '0.25rem 0.7rem', borderRadius: 20, fontSize: '0.78rem', background: 'rgba(249,115,22,0.1)', color: 'var(--warn)', border: '1px solid rgba(249,115,22,0.2)' }}>
                      ↑ {imp}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Q&A Breakdown */}
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1.2rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
            ❓ Question-by-Question Breakdown
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {session.questions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No questions recorded for this session.</p>
            ) : (
              session.questions.map(q => <QAItem key={q.id} q={q} />)
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 1.4rem', borderRadius: 8,
            fontFamily: 'var(--font)', fontSize: '0.9rem', fontWeight: 600,
            background: 'var(--accent)', color: '#fff', border: 'none',
          }}>
            Start New Interview
          </Link>
          <Link href="/dashboard" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 1.4rem', borderRadius: 8,
            fontFamily: 'var(--font)', fontSize: '0.9rem', fontWeight: 600,
            border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)',
          }}>
            View All Sessions
          </Link>
        </div>
      </div>
    </>
  );
}
