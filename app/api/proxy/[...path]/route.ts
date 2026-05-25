import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

const DJANGO_URL = process.env.DJANGO_URL ?? 'http://localhost:8000';

function buildDjangoPath(pathSegments: string[]): string {
  return `/${pathSegments.join('/')}/`;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('tg_auth_token')?.value;
  return token ? { Authorization: `Token ${token}` } : {};
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const djangoPath = buildDjangoPath(path);
  const body = await request.text();
  const authHeaders = await getAuthHeaders();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeaders,
  };

  try {
    const djangoRes = await fetch(`${DJANGO_URL}${djangoPath}`, {
      method: 'POST',
      headers,
      body,
    });

    const data = await djangoRes.json();
    return Response.json(data, { status: djangoRes.status });
  } catch {
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
  const authHeaders = await getAuthHeaders();

  try {
    const djangoRes = await fetch(`${DJANGO_URL}${djangoPath}`, {
      method: 'GET',
      headers: { Accept: 'application/json', ...authHeaders },
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
