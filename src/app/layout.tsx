import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TrackRail — Live Train Status & Spotting',
  description:
    'Real-time Indian Railways live train status, GPS telemetry, station arrival boards, platform locators, and interactive route tracker.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F7F3EE] text-[#1C1917] antialiased min-h-screen selection:bg-[#FF5A1F]/20 selection:text-[#1C1917]">
        {children}
      </body>
    </html>
  );
}
