import { cookies } from 'next/headers';

const DJANGO_URL = process.env.DJANGO_URL ?? 'http://localhost:8000';

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body;

  if (!username || !password) {
    return Response.json(
      { error: 'Username and password are required.' },
      { status: 400 }
    );
  }

  let djangoData: { token: string; user_id: number; username: string };
  try {
    const djangoRes = await fetch(`${DJANGO_URL}/api/v1/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!djangoRes.ok) {
      const errData = await djangoRes.json().catch(() => ({}));
      return Response.json(
        { error: (errData as { error?: string }).error ?? 'Invalid credentials.' },
        { status: 401 }
      );
    }

    djangoData = await djangoRes.json();
  } catch {
    return Response.json(
      { error: 'Cannot reach the backend server. Please ensure it is running.' },
      { status: 502 }
    );
  }

  const { token, user_id, username: djangoUsername } = djangoData;

  const cookieStore = await cookies();

  // Store token in a cookie accessible to both server and client
  cookieStore.set('tg_auth_token', token, {
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  // Keep tg_user cookie for sidebar / UI state
  cookieStore.set(
    'tg_user',
    JSON.stringify({ username: djangoUsername, role: 'admin' }),
    {
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    }
  );

  return Response.json({
    success: true,
    token,
    user_id,
    username: djangoUsername,
    role: 'admin',
  });
}
