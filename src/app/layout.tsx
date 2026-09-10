import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RAILPULSE AI - Where is My Train | Live Train Status & Spotting',
  description:
    'Real-time Indian Railways live train running status, GPS telemetry, speed gauge, station timelines, platform finder and coach layout.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
