import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { email, name } = await request.json();

  if (!email || !name) {
    return Response.json({ error: 'Email and name are required.' }, { status: 400 });
  }

  const role = email.toLowerCase() === 'admin@ivoyant.com' ? 'admin' : 'candidate';
  const user = { email: email.toLowerCase(), name, role };

  const cookieStore = await cookies();
  cookieStore.set('tg_user', JSON.stringify(user), {
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return Response.json({ success: true, role, name });
}
