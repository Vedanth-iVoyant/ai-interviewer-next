import { redirect } from 'next/navigation';
import InterviewRoom from './InterviewRoom';

const DJANGO_URL = process.env.DJANGO_URL ?? 'http://localhost:8000';

async function getSessionStatus(sessionId: number) {
  try {
    const res = await fetch(`${DJANGO_URL}/api/sessions/${sessionId}/`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function InterviewPage(props: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await props.params;
  const id = parseInt(sessionId, 10);

  // If Django exposes a session JSON endpoint, redirect already-evaluated sessions
  const session = await getSessionStatus(id);
  if (session && (session.status === 'completed' || session.status === 'evaluated')) {
    redirect(`/results/${id}`);
  }

  return <InterviewRoom sessionId={id} />;
}
