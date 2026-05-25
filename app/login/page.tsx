'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function TalentGateIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Please enter your full name.'); return; }
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email address.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? 'Login failed. Please try again.');
        setLoading(false);
        return;
      }
      if (data.role === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/user/dashboard');
      }
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Radial glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 700,
        height: 700,
        background: 'radial-gradient(circle at center, rgba(59,130,246,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: 420,
        padding: '0 1.5rem',
      }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 60,
            height: 60,
            borderRadius: 16,
            background: 'rgba(59,130,246,0.12)',
            border: '1px solid rgba(59,130,246,0.25)',
            marginBottom: '1rem',
          }}>
            <TalentGateIcon />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)' }}>
            Talent<span style={{ color: 'var(--accent)' }}>Gate</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem', fontSize: '0.875rem' }}>
            AI-Powered Interview Platform
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '2rem',
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text)' }}>
            Sign in to continue
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            Enter your details to access the platform.
          </p>

          {error && (
            <div style={{
              padding: '0.7rem 1rem',
              borderRadius: 8,
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: 'var(--fail)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.45rem',
              }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Arjun Sharma"
                autoComplete="name"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: 8,
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontFamily: 'var(--font)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  opacity: loading ? 0.7 : 1,
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.45rem',
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: 8,
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontFamily: 'var(--font)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  opacity: loading ? 0.7 : 1,
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 8,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: 'var(--accent)',
                color: '#fff',
                fontFamily: 'var(--font)',
                fontSize: '0.95rem',
                fontWeight: 600,
                opacity: loading ? 0.7 : 1,
                transition: 'opacity 0.15s',
                marginTop: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {loading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Signing in…
                </>
              ) : (
                'Continue →'
              )}
            </button>
          </form>
        </div>

        {/* Admin hint */}
        <p style={{
          textAlign: 'center',
          marginTop: '1.25rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}>
          Admin access:{' '}
          <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)', opacity: 0.8 }}>
            admin@ivoyant.com
          </span>
        </p>
      </div>
    </div>
  );
}
