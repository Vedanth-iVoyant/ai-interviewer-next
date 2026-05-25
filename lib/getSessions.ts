import { cookies } from 'next/headers';
import type { InterviewSession } from './types';

const DJANGO_URL = process.env.DJANGO_URL ?? 'http://localhost:8000';

export async function getSessions(): Promise<InterviewSession[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('tg_auth_token')?.value;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers['Authorization'] = `Token ${token}`;

  try {
    const res = await fetch(`${DJANGO_URL}/api/v1/sessions/`, {
      cache: 'no-store',
      headers,
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
