import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdmissionDisclaimer } from '@/components/AdmissionDisclaimer';
import { JsonLd, buildArticleSchema, buildBreadcrumbSchema } from '@/components/seo/JsonLd';
import { SITE_CONFIG, absoluteUrl } from '@/config/site';

const PAGE_TITLE = 'About Us | UNILAG Aggregate Calculator Project';
const PAGE_DESCRIPTION = 'Learn about the mission, data verification methodology, and technical architecture of the independent UNILAG Aggregate Calculator web utility.';
const PAGE_PATH = '/about';

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

export default function AboutPage() {
  const schemas = [
    buildBreadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'About Us', path: PAGE_PATH }
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
            Project Overview & Methodology
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0F2942] tracking-tight">
            About the UNILAG Aggregate Calculator
          </h1>
          <p className="text-base text-slate-600">
            An open-access, privacy-first educational tool providing transparent admission score estimates for University of Lagos applicants.
          </p>
        </header>

        {/* Mission Section */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <h2 className="text-xl font-bold text-[#0F2942]">
            Our Purpose & Mission
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Securing undergraduate admission into the University of Lagos (UNILAG) is one of the most competitive academic milestones in Nigeria, with tens of thousands of UTME candidates contending for limited departmental quotas annually.
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">
            The <strong>UNILAG Aggregate Calculator</strong> was engineered to eliminate ambiguity around how composite admission scores are determined. We believe every student, parent, and secondary school counselor deserves free, immediate, and mathematically verified insight into their admission standing without aggressive advertisements, forced registrations, or speculative admission guarantees.
          </p>
        </section>

        {/* Data Verification Standards */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#0F2942]">
            Methodology & Data Verification Standards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                1. Official Source Grounding
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                All scoring rules, component weights (UTME 50%, Post-UTME 30%, O'Level 20%), and grade conversion tables are derived exclusively from officially published UNILAG admission circulars. We do not invent rules or unverified scaling factors.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                2. Explicit Verification Status
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our calculation engine explicitly isolates confirmed historical sessions (2025/2026) from preliminary upcoming sessions (2026/2027). If official modalities have not been released for a new academic year, the system clearly alerts the user.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                3. High Mathematical Precision
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scoring computations are handled in pure TypeScript using strict IEEE 754 floating-point safeguards to ensure accurate 3-decimal precision without rounding drift.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                4. 100% In-Browser Privacy
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                All calculations and image scans execute entirely on your device. We operate with a strict zero-collection policy: no databases, no tracking cookies, and no third-party telemetry.
              </p>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
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
            href="/contact"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Report an update or issue →
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
