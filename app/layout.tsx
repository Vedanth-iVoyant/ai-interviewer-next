import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Sidebar from './Sidebar';
import AppShell from './AppShell';
import { StoreProvider } from '@/store/provider';

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
        <StoreProvider>
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <AppShell>{children}</AppShell>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
