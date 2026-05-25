import type { InterviewSession } from './types';
import { MOCK_SESSIONS } from './mockData';

const DJANGO_URL = process.env.DJANGO_URL ?? 'http://localhost:8000';

export async function getSessions(): Promise<InterviewSession[]> {
  try {
    const res = await fetch(`${DJANGO_URL}/api/sessions/`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return MOCK_SESSIONS;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return MOCK_SESSIONS;
    return data;
  } catch {
    return MOCK_SESSIONS;
  }
}
