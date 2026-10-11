import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'UNILAG Aggregate Calculator | 2026/2027 Admission Screening Estimator',
  description: 'Free, accurate University of Lagos (UNILAG) undergraduate admission aggregate calculator. Computes UTME (50%), Post-UTME (30%), and O\'Level (20%) scores with official departmental cut-off comparison.',
  keywords: [
    'UNILAG aggregate calculator',
    'University of Lagos cut off mark',
    'UNILAG post UTME calculator',
    'UNILAG admission requirements',
    'UNILAG aggregate formula',
    'JAMB cut off UNILAG'
  ],
  authors: [{ name: 'UNILAG Aggregate Calculator Technical Project' }],
  robots: {
    index: true,
    follow: true
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0F2942'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans flex flex-col">
        {children}
      </body>
    </html>
  );
}
