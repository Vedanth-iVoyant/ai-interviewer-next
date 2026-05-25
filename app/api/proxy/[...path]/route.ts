import type { NextRequest } from 'next/server';

const DJANGO_URL = process.env.DJANGO_URL ?? 'http://localhost:8000';

let cachedCsrf: string | null = null;

async function getDjangoCsrfToken(): Promise<string> {
  if (cachedCsrf) return cachedCsrf;
  try {
    const res = await fetch(`${DJANGO_URL}/`, {
      method: 'GET',
      cache: 'no-store',
    });
    const setCookie = res.headers.get('set-cookie') ?? '';
    const match = setCookie.match(/csrftoken=([^;,\s]+)/);
    cachedCsrf = match?.[1] ?? '';
  } catch {
    cachedCsrf = '';
  }
  return cachedCsrf;
}

function buildDjangoPath(pathSegments: string[]): string {
  return `/${pathSegments.join('/')}/`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const djangoPath = buildDjangoPath(path);
  const body = await request.text();

  const csrfToken = await getDjangoCsrfToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (csrfToken) {
    headers['Cookie'] = `csrftoken=${csrfToken}`;
    headers['X-CSRFToken'] = csrfToken;
  }

  try {
    const djangoRes = await fetch(`${DJANGO_URL}${djangoPath}`, {
      method: 'POST',
      headers,
      body,
    });

    const data = await djangoRes.json();
    return Response.json(data, { status: djangoRes.status });
  } catch (err) {
    return Response.json(
      { error: `Failed to reach Django backend at ${DJANGO_URL}${djangoPath}` },
      { status: 502 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const djangoPath = buildDjangoPath(path);

  try {
    const djangoRes = await fetch(`${DJANGO_URL}${djangoPath}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });

    if (!djangoRes.ok) {
      return Response.json(
        { error: `Django returned ${djangoRes.status}` },
        { status: djangoRes.status }
      );
    }

    const data = await djangoRes.json();
    return Response.json(data);
  } catch {
    return Response.json(
      { error: `Failed to reach Django backend at ${DJANGO_URL}${djangoPath}` },
      { status: 502 }
    );
  }
}
