import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdmissionDisclaimer } from '@/components/AdmissionDisclaimer';
import { JsonLd, buildArticleSchema, buildBreadcrumbSchema } from '@/components/seo/JsonLd';
import { SITE_CONFIG, absoluteUrl } from '@/config/site';

const PAGE_TITLE = 'Contact & Error Reporting | UNILAG Aggregate Calculator';
const PAGE_DESCRIPTION = 'Submit admissions circular updates, report score calculation discrepancies, or suggest corrections for the UNILAG Aggregate Calculator.';
const PAGE_PATH = '/contact';

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

export default function ContactPage() {
  const schemas = [
    buildBreadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Contact & Feedback', path: PAGE_PATH }
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#0F2942]/10 text-[#0F2942]">
            Feedback & Data Integrity
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0F2942] tracking-tight">
            Contact Us & Suggest Data Corrections
          </h1>
          <p className="text-base text-slate-600">
            Help us keep UNILAG admission screening formulas and departmental cut-off records 100% accurate.
          </p>
        </header>

        {/* Reporting Guidance */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <h2 className="text-xl font-bold text-[#0F2942]">
            How to Report a Discrepancy or Update
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Because university admissions guidelines can evolve each academic session, we welcome feedback from prospective candidates, secondary school teachers, and admissions officers.
          </p>
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-[#0F2942] text-sm shrink-0">1.</span>
              <div className="text-xs text-slate-700 leading-relaxed">
                <strong>Reporting Cut-Off Mark Changes:</strong> If the University of Lagos releases a revised or supplementary cut-off notice, please share the official PDF or the direct URL from <code className="text-[#0F2942] bg-slate-200 px-1 py-0.5 rounded">unilag.edu.ng</code>.
              </div>
            </div>
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-[#0F2942] text-sm shrink-0">2.</span>
              <div className="text-xs text-slate-700 leading-relaxed">
                <strong>Reporting Formula Discrepancies:</strong> If you believe a specific O'Level subject grading point or division factor has changed, cite the applicable paragraph from the official Post-UTME screening advertisement.
              </div>
            </div>
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-[#0F2942] text-sm shrink-0">3.</span>
              <div className="text-xs text-slate-700 leading-relaxed">
                <strong>Reporting Technical Bugs:</strong> For issues related to result slip image scanning, browser layout, or calculation display, note your device and browser version.
              </div>
            </div>
          </div>
        </section>

        {/* Security and Privacy Warning */}
        <section className="p-5 rounded-xl border border-amber-300 bg-amber-50 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
            <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Important Security & Confidentiality Advisory</span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            <strong>NEVER send sensitive personal credentials:</strong> Do not include your JAMB profile password, e-facility login PINs, payment receipts, or examination scratch card serial numbers in any correspondence. We will never ask for your confidential account information.
          </p>
        </section>

        {/* Official Channels */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
          <h2 className="text-lg font-bold text-[#0F2942]">
            Official Admissions Office Inquiries
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Please note that the <strong>UNILAG Aggregate Calculator is an independent tool</strong>. We cannot process university applications, resolve JAMB CAPS admission status delays, or offer official admission advice. For direct institutional inquiries, contact the official UNILAG Admissions Office:
          </p>
          <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside pt-1">
            <li>
              University of Lagos Admissions Office: <a href="https://admissions.unilag.edu.ng/" target="_blank" rel="noopener noreferrer" className="text-[#0F2942] underline font-semibold">admissions.unilag.edu.ng ↗</a>
            </li>
            <li>
              UNILAG Applications Portal: <a href="https://applications.unilag.edu.ng/" target="_blank" rel="noopener noreferrer" className="text-[#0F2942] underline font-semibold">applications.unilag.edu.ng ↗</a>
            </li>
          </ul>
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
            Read about our project →
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
