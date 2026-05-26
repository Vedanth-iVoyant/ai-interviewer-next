'use client';

import { usePathname } from 'next/navigation';

const AUTH_PATHS = ['/login', '/signup', '/interview'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some(p => pathname.startsWith(p));

  return (
    <main
      style={{
        flex: 1,
        marginLeft: isAuthPage ? 0 : 'var(--sidebar-width)',
        minHeight: '100vh',
        background: 'var(--bg)',
      }}
    >
      {children}
    </main>
  );
}
