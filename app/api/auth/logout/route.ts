import { cookies } from 'next/headers';

const DJANGO_URL = process.env.DJANGO_URL ?? 'http://localhost:8000';

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get('tg_auth_token')?.value;

  // Call Django logout to invalidate the token server-side
  if (token) {
    try {
      await fetch(`${DJANGO_URL}/api/v1/auth/logout/`, {
        method: 'POST',
        headers: { Authorization: `Token ${token}` },
      });
    } catch {
      // Continue logout even if Django call fails
    }
  }

  cookieStore.set('tg_auth_token', '', { maxAge: 0, path: '/' });
  cookieStore.set('tg_user', '', { maxAge: 0, path: '/' });

  return Response.json({ success: true });
}
