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

  // Step 1: Register the user
  try {
    const registerRes = await fetch(`${DJANGO_URL}/api/v1/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password }),
    });

    if (!registerRes.ok) {
      const errData = await registerRes.json().catch(() => ({}));
      const message =
        (errData as { detail?: string; error?: string }).detail ??
        (errData as { detail?: string; error?: string }).error ??
        'Registration failed. Please try again.';
      return Response.json({ error: message }, { status: registerRes.status });
    }
  } catch {
    return Response.json(
      { error: 'Cannot reach the backend server. Please ensure it is running.' },
      { status: 502 }
    );
  }

  // Step 2: Auto-login to get the token
  let loginData: { token: string; user_id: number; username: string };
  try {
    const loginRes = await fetch(`${DJANGO_URL}/api/v1/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password }),
    });

    if (!loginRes.ok) {
      return Response.json(
        { error: 'Account created but auto-login failed. Please sign in manually.' },
        { status: 500 }
      );
    }

    loginData = await loginRes.json();
  } catch {
    return Response.json(
      { error: 'Account created but cannot reach the server. Please sign in manually.' },
      { status: 502 }
    );
  }

  const { token, user_id, username: createdUsername } = loginData;
  const cookieStore = await cookies();

  cookieStore.set('tg_auth_token', token, {
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  cookieStore.set(
    'tg_user',
    JSON.stringify({ username: createdUsername, role: 'admin' }),
    {
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    }
  );

  return Response.json(
    { success: true, token, user_id, username: createdUsername },
    { status: 201 }
  );
}
