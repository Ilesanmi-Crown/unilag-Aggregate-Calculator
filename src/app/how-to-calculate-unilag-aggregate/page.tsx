import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdmissionDisclaimer } from '@/components/AdmissionDisclaimer';

import { JsonLd, buildArticleSchema, buildBreadcrumbSchema } from '@/components/seo/JsonLd';
import { SITE_CONFIG, absoluteUrl } from '@/config/site';

const PAGE_TITLE = 'How to Calculate UNILAG Aggregate Score | Step-by-Step 50:30:20 Guide';
const PAGE_DESCRIPTION = 'Learn the exact mathematical formula used by the University of Lagos (UNILAG) to calculate admission aggregate scores from UTME (50%), Post-UTME (30%), and O\'Level grades (20%). Includes worked examples.';
const PAGE_PATH = '/how-to-calculate-unilag-aggregate';

export const metadata: Metadata = {
  title: 'How to Calculate UNILAG Aggregate Score | Step-by-Step 50:30:20 Guide',
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

export default function HowToCalculateAggregatePage() {
  const schemas = [
    buildBreadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'How to Calculate Aggregate Score', path: PAGE_PATH }
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
            Official Admissions Guide
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0F2942] tracking-tight">
            How to Calculate UNILAG Aggregate Score (Complete Guide)
          </h1>
          <p className="text-base text-slate-600">
            A comprehensive, transparent breakdown of the University of Lagos composite undergraduate scoring system for UTME applicants.
          </p>
        </header>

        {/* Quick Summary Answer */}
        <section className="bg-white border-l-4 border-[#0F2942] p-5 sm:p-6 rounded-r-xl shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            Quick Summary: The 50:30:20 Scoring Formula
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            The University of Lagos evaluates undergraduate UTME applicants on a composite <strong>100-point merit scale</strong> using three distinct components:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
              <span className="text-xs uppercase font-bold text-slate-500 block">JAMB / UTME</span>
              <span className="text-xl font-extrabold text-[#0F2942]">50%</span>
              <span className="text-xs text-slate-500 block">UTME Score &divide; 8</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
              <span className="text-xs uppercase font-bold text-slate-500 block">Post-UTME</span>
              <span className="text-xl font-extrabold text-[#0F2942]">30%</span>
              <span className="text-xs text-slate-500 block">Raw Score / 30</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
              <span className="text-xs uppercase font-bold text-slate-500 block">O&apos;Level Grades</span>
              <span className="text-xl font-extrabold text-[#0F2942]">20%</span>
              <span className="text-xs text-slate-500 block">Best 5 relevant credits</span>
            </div>
          </div>
        </section>

        {/* Step-by-Step Breakdown */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-[#0F2942]">
            Step-by-Step Mathematical Computation
          </h2>

          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                1. Calculate Your UTME (JAMB) Contribution (Max 50 Points)
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                JAMB tests candidates across 4 subjects for a total of 400 marks. UNILAG converts this 400-point total into a 50-point score by dividing your raw score by 8.
              </p>
              <div className="bg-slate-100 p-3 rounded text-xs font-mono text-slate-800">
                UTME Points = Candidate Raw UTME Score &divide; 8
              </div>
              <p className="text-xs text-slate-500">
                <em>Example:</em> A candidate scoring 280 in UTME receives <strong>35.000 points</strong> (280 &divide; 8).
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                2. Calculate Your Post-UTME Contribution (Max 30 Points)
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                UNILAG conducts a computer-based online screening aptitude test scored directly out of 30 marks. Your raw score in this test represents your Post-UTME contribution.
              </p>
              <div className="bg-slate-100 p-3 rounded text-xs font-mono text-slate-800">
                Post-UTME Points = Raw Post-UTME Score (0.0 to 30.0)
              </div>
              <p className="text-xs text-slate-500">
                <em>Example:</em> A candidate scoring 22.5 marks receives <strong>22.500 points</strong>. Historically, a pass mark of 12.0/30 (40%) was required for departmental merit consideration.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                3. Calculate Your O&apos;Level Contribution (Max 20 Points)
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                UNILAG evaluates your best <strong>five (5) relevant credit subjects</strong> at <strong>ONE SITTING ONLY</strong>. Results combined from two sittings (e.g. WAEC and NECO) are not accepted.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-200 mt-2">
                  <thead className="bg-slate-50 text-slate-700 font-bold">
                    <tr>
                      <th className="p-2 border">Grade</th>
                      <th className="p-2 border">Point Value</th>
                      <th className="p-2 border">Weight Calculation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr><td className="p-2 border font-bold">A1</td><td className="p-2 border font-semibold text-[#0F2942]">4.0 Points</td><td className="p-2 border text-slate-500">10 &times; 0.4</td></tr>
                    <tr><td className="p-2 border font-bold">B2</td><td className="p-2 border font-semibold text-[#0F2942]">3.6 Points</td><td className="p-2 border text-slate-500">9 &times; 0.4</td></tr>
                    <tr><td className="p-2 border font-bold">B3</td><td className="p-2 border font-semibold text-[#0F2942]">3.2 Points</td><td className="p-2 border text-slate-500">8 &times; 0.4</td></tr>
                    <tr><td className="p-2 border font-bold">C4</td><td className="p-2 border font-semibold text-[#0F2942]">2.8 Points</td><td className="p-2 border text-slate-500">7 &times; 0.4</td></tr>
                    <tr><td className="p-2 border font-bold">C5</td><td className="p-2 border font-semibold text-[#0F2942]">2.4 Points</td><td className="p-2 border text-slate-500">6 &times; 0.4</td></tr>
                    <tr><td className="p-2 border font-bold">C6</td><td className="p-2 border font-semibold text-[#0F2942]">2.0 Points</td><td className="p-2 border text-slate-500">5 &times; 0.4</td></tr>
                    <tr><td className="p-2 border font-bold text-red-600">D7, E8, F9</td><td className="p-2 border text-red-600 font-semibold">0.0 Points</td><td className="p-2 border text-red-500">Non-credit / Disqualifying</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="bg-[#0F2942] text-white p-6 rounded-xl space-y-3 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">Try the Interactive Aggregate Calculator</h2>
            <p className="text-xs text-slate-300">
              Calculate your composite aggregate instantly and check your target cut-off margin.
            </p>
          </div>
          <Link
            href="/"
            className="inline-block mt-3 sm:mt-0 px-5 py-2.5 rounded-lg bg-white text-[#0F2942] font-bold text-sm hover:bg-slate-100 transition-colors shadow"
          >
            Open Calculator
          </Link>
        </section>

        <AdmissionDisclaimer />
      </main>
      <Footer />
    </>
  );
}
