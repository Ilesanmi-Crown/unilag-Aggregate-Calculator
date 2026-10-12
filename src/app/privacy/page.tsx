import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdmissionDisclaimer } from '@/components/AdmissionDisclaimer';
import { JsonLd, buildArticleSchema, buildBreadcrumbSchema } from '@/components/seo/JsonLd';
import { SITE_CONFIG, absoluteUrl } from '@/config/site';

const PAGE_TITLE = 'Privacy Policy | UNILAG Aggregate Calculator';
const PAGE_DESCRIPTION = 'Our strict in-browser privacy policy: Zero user tracking, zero data storage, and 100% local client-side result slip processing.';
const PAGE_PATH = '/privacy';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: PAGE_PATH
  },
  openGraph: {
    type: 'article',
    locale: SITE_CONFIG.locale,
    url: absoluteUrl(PAGE_PATH),
    siteName: SITE_CONFIG.name,
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION
  }
};

export default function PrivacyPage() {
  const schemas = [
    buildBreadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Privacy Policy', path: PAGE_PATH }
    ]),
    buildArticleSchema({
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      path: PAGE_PATH,
      datePublished: '2026-09-18T00:00:00Z',
      dateModified: '2026-10-11T00:00:00Z'
    })
  ];

  return (
    <>
      <JsonLd schema={schemas} />
      <Header />
      <main id="main-content" className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <header className="space-y-3 pb-6 border-b border-slate-200">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Client-Side Privacy Guarantee
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0F2942] tracking-tight">
            Privacy Policy & Data Protection
          </h1>
          <p className="text-base text-slate-600">
            We operate with a strict zero-data-collection architecture. Your scores, academic records, and images never leave your device.
          </p>
        </header>

        {/* Core Guarantee */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <h2 className="text-xl font-bold text-[#0F2942]">
            1. Zero Collection of Personal & Academic Data
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            The <strong>UNILAG Aggregate Calculator</strong> does not require user registration, email addresses, phone numbers, or candidate passwords. All numerical inputs entered into the calculator (UTME score, Post-UTME score, O'Level subject grades) are processed purely within your device's browser memory.
          </p>
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg text-xs text-emerald-900 leading-relaxed font-medium">
            <strong>Key Guarantee:</strong> We do NOT operate a database. Your calculated aggregate scores are never transmitted across the network, saved on a remote server, or sold to third parties.
          </div>
        </section>

        {/* OCR Result Image Processing */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <h2 className="text-xl font-bold text-[#0F2942]">
            2. Result Slip Image Scanning (OCR) Safeguards
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            When you use our optional <strong>"Scan Result Slip"</strong> feature to interpret a JAMB, WAEC, or Post-UTME slip:
          </p>
          <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside leading-relaxed pl-1">
            <li>
              <strong>100% In-Browser Execution:</strong> Optical character recognition runs entirely inside your browser using Tesseract.js via WebAssembly and Web Workers.
            </li>
            <li>
              <strong>Zero Cloud Uploads:</strong> The uploaded image is never sent to any third-party vision API (e.g. OpenAI, Google Cloud Vision, or AWS).
            </li>
            <li>
              <strong>Immediate Memory Revocation:</strong> Local image blob references (<code className="bg-slate-100 px-1 py-0.5 rounded text-[#0F2942]">blob:</code> URLs) are explicitly revoked and removed from browser memory as soon as the modal is closed.
            </li>
            <li>
              <strong>No Storage Persistence:</strong> Extracted candidate names, registration numbers, and subject marks are not saved to <code className="bg-slate-100 px-1 py-0.5 rounded text-[#0F2942]">localStorage</code> or <code className="bg-slate-100 px-1 py-0.5 rounded text-[#0F2942]">sessionStorage</code>.
            </li>
          </ul>
        </section>

        {/* Cookies and Analytics */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
          <h2 className="text-xl font-bold text-[#0F2942]">
            3. Cookies & Tracking Scripts
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed">
            We do not use advertising tracking cookies, behavioral profiling scripts, or marketing pixels. The website is delivered as lightweight, static HTML, CSS, and JavaScript.
          </p>
        </section>

        {/* Third-Party Hosting */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
          <h2 className="text-xl font-bold text-[#0F2942]">
            4. Web Hosting & Infrastructure
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed">
            This website is hosted on static content delivery networks (e.g., Vercel / Cloudflare). Like virtually all web servers, standard non-identifying server logs (such as requesting IP address, user agent, and timestamp) are processed by the hosting provider solely for DDoS prevention, security, and network performance.
          </p>
        </section>

        <AdmissionDisclaimer />

        {/* Back Link */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-bold text-[#0F2942] hover:underline flex items-center gap-1"
          >
            ← Return to Aggregate Calculator
          </Link>
          <Link
            href="/about"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Learn about our mission →
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
