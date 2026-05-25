import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Sidebar from './Sidebar';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'TalentGate – AI Interviewer',
  description: 'AI-Powered Interview Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <main style={{
            flex: 1,
            marginLeft: 'var(--sidebar-width)',
            minHeight: '100vh',
            background: 'var(--bg)',
          }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
