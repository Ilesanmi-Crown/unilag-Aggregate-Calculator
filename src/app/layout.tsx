import type { Metadata, Viewport } from 'next';
import './globals.css';
import { getSiteUrl, SITE_CONFIG } from '@/config/site';

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_CONFIG.name} | 2026/2027 Admission Screening Estimator`,
    template: `%s | ${SITE_CONFIG.name}`
  },
  description: SITE_CONFIG.description,
  keywords: [
    'UNILAG aggregate calculator',
    'University of Lagos cut off mark',
    'UNILAG post UTME calculator',
    'UNILAG admission requirements',
    'UNILAG aggregate formula',
    'UNILAG O level grade points',
    'JAMB cut off UNILAG',
    'UNILAG merit cut off mark'
  ],
  authors: [{ name: SITE_CONFIG.author }],
  creator: SITE_CONFIG.author,
  publisher: SITE_CONFIG.author,
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    locale: SITE_CONFIG.locale,
    url: getSiteUrl(),
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} | 2026/2027 Admission Screening Estimator`,
    description: SITE_CONFIG.description
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_CONFIG.name} | 2026/2027 Admission Screening Estimator`,
    description: SITE_CONFIG.description
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  verification: {
    google: 'google21c512e51f10d1ad'
  },
  other: {
    'google-site-verification': 'google21c512e51f10d1ad.html'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: SITE_CONFIG.defaultThemeColor
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
