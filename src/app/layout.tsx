'use client';

import './globals.css';
import { useEffect } from 'react';
import { useMissionControl } from '@/lib/store';
import { getShell, getShellCSSVariables } from '@/shells/registry';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const activeShellId = useMissionControl((s) => s.activeShellId);

  useEffect(() => {
    const shell = getShell(activeShellId);
    const vars = getShellCSSVariables(shell);
    const root = document.documentElement;
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
  }, [activeShellId]);

  return (
    <html lang="en" className="dark">
      <head>
        <title>Clawbot Mission Control</title>
        <meta name="description" content="AI Agent Orchestration Dashboard — Manage your claw army." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%2306b6d4' opacity='0.2'/><path d='M30 60 Q50 25 70 60 Q60 55 50 58 Q40 55 30 60Z' fill='%2306b6d4'/><circle cx='38' cy='48' r='4' fill='%230a0a1a'/><circle cx='62' cy='48' r='4' fill='%230a0a1a'/></svg>" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
