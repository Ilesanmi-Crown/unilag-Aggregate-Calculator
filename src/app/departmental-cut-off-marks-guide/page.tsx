import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdmissionDisclaimer } from '@/components/AdmissionDisclaimer';

import { JsonLd, buildArticleSchema, buildBreadcrumbSchema } from '@/components/seo/JsonLd';
import { SITE_CONFIG, absoluteUrl } from '@/config/site';

const PAGE_TITLE = 'UNILAG Departmental Cut-Off Marks Explained | Merit & Catchment Guide';
const PAGE_DESCRIPTION = 'Understand how UNILAG sets undergraduate departmental cut-off marks, the difference between Merit (45%) and South-Western Catchment (35%) quotas, and what NIL marks mean.';
const PAGE_PATH = '/departmental-cut-off-marks-guide';

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

export default function CutoffMarksGuidePage() {
  const schemas = [
    buildBreadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Departmental Cut-Off Marks Guide', path: PAGE_PATH }
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
            Admissions Policy Explainer
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0F2942] tracking-tight">
            Understanding UNILAG Departmental Cut-Off Marks
          </h1>
          <p className="text-base text-slate-600">
            How the University of Lagos determines undergraduate cut-off thresholds across Merit and Catchment quotas.
          </p>
        </header>

        {/* Section 1: How Cut-Off Marks Work */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <h2 className="text-lg font-bold text-[#0F2942]">
            What are Departmental Cut-Off Marks?
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Departmental cut-off marks represent the lowest composite aggregate scores admitted into specific degree programmes for a given academic session. Cut-offs are determined competitively after all Post-UTME screening results are compiled, based on departmental capacity, applicant performance, and federal admission quotas.
          </p>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-xs text-amber-900 leading-relaxed">
            <strong>Important Distinction:</strong> Meeting the general university eligibility threshold (such as scoring 200 in JAMB) does not guarantee admission. Candidates must meet the specific composite cut-off mark published for their chosen programme and candidate quota.
          </div>
        </section>

        {/* Section 2: Merit vs Catchment Quota */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#0F2942]">
            National Merit vs. Catchment Area Policy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-900">
                National Merit Quota (45%)
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Open to All Nigerian States
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The Merit cut-off is the highest benchmark for any department. Top candidates from all 36 states and the Federal Capital Territory compete on this list strictly on the basis of their composite aggregate score.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-900">
                Catchment Quota (35%)
              </span>
              <h3 className="text-base font-bold text-slate-900">
                South-Western States Only
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                By federal guideline, UNILAG&apos;s catchment area comprises the six South-Western states: <strong>Ekiti, Lagos, Ogun, Ondo, Osun, and Oyo</strong>. Eligible candidates from these states who miss the National Merit mark are evaluated against their home state&apos;s specific catchment cut-off.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Understanding "NIL" */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
          <h2 className="text-lg font-bold text-[#0F2942]">
            What Does &quot;NIL&quot; Mean in Official Cut-Off Lists?
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            In official UNILAG releases, certain departments or states have &quot;NIL&quot; published instead of a numerical score. This designation means:
          </p>
          <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1.5 leading-relaxed">
            <li><strong>Not a zero score:</strong> NIL does not indicate a cut-off score of 0.000.</li>
            <li><strong>No qualified candidates:</strong> No candidates from that state or category qualified or met prerequisite department thresholds.</li>
            <li><strong>Special admission review:</strong> For newly unbundled departments (e.g. Landscape Architecture), entry is managed via direct departmental verification.</li>
          </ul>
        </section>

        {/* Primary Sources */}
        <section className="bg-slate-100 p-5 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-700">
          <h2 className="text-sm font-bold text-slate-900">
            Official Source Citation
          </h2>
          <p>
            Cut-off marks displayed on this platform are audited against the official circular published by the University of Lagos Admissions Office:
          </p>
          <a
            href="https://unilag.edu.ng/unilag-releases-2026-2027-utme-merit-cut-off-marks/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0F2942] underline font-semibold break-all"
          >
            https://unilag.edu.ng/unilag-releases-2026-2027-utme-merit-cut-off-marks/
          </a>
        </section>

        {/* CTA */}
        <section className="bg-[#0F2942] text-white p-6 rounded-xl space-y-3 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">Explore the 112 Departmental Cut-Off Marks</h2>
            <p className="text-xs text-slate-300">
              Browse every faculty and compare your aggregate score against published thresholds.
            </p>
          </div>
          <Link
            href="/#cutoffs-section"
            className="inline-block mt-3 sm:mt-0 px-5 py-2.5 rounded-lg bg-white text-[#0F2942] font-bold text-sm hover:bg-slate-100 transition-colors shadow"
          >
            View Department Directory
          </Link>
        </section>

        <AdmissionDisclaimer />
      </main>
      <Footer />
    </>
  );
}
