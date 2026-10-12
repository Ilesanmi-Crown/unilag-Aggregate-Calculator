import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Page Not Found (404)',
  description: 'The requested admission resource could not be found. Navigate back to the UNILAG Aggregate Calculator or explore admission scoring guides.',
  robots: {
    index: false,
    follow: true
  }
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main-content" className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-8">
        <div className="space-y-3">
          <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-slate-200 text-slate-800">
            Error 404
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F2942] tracking-tight">
            Page Not Found
          </h1>
          <p className="text-base text-slate-600 max-w-lg mx-auto">
            The admissions tool, guide, or page you requested could not be located. It may have been moved, renamed, or temporarily unavailable.
          </p>
        </div>

        {/* Helpful Recovery Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
          <Link
            href="/"
            className="p-5 rounded-xl border border-slate-200 bg-white hover:border-[#0F2942] hover:shadow-md transition-all group"
          >
            <div className="text-base font-bold text-[#0F2942] group-hover:underline">
              Calculate Admission Aggregate →
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Use our interactive 50:30:20 estimator for UTME, Post-UTME, and O'Level scores.
            </p>
          </Link>

          <Link
            href="/#cutoffs-section"
            className="p-5 rounded-xl border border-slate-200 bg-white hover:border-[#0F2942] hover:shadow-md transition-all group"
          >
            <div className="text-base font-bold text-[#0F2942] group-hover:underline">
              Browse Department Cut-Offs →
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Search official merit and catchment benchmarks across all 112 UNILAG programmes.
            </p>
          </Link>

          <Link
            href="/how-to-calculate-unilag-aggregate"
            className="p-5 rounded-xl border border-slate-200 bg-white hover:border-[#0F2942] hover:shadow-md transition-all group"
          >
            <div className="text-base font-bold text-[#0F2942] group-hover:underline">
              Read Mathematical Guide →
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Step-by-step breakdown of how UNILAG grades single-sitting O'Level and converts UTME.
            </p>
          </Link>

          <Link
            href="/departmental-cut-off-marks-guide"
            className="p-5 rounded-xl border border-slate-200 bg-white hover:border-[#0F2942] hover:shadow-md transition-all group"
          >
            <div className="text-base font-bold text-[#0F2942] group-hover:underline">
              Cut-Off Marks & Catchment Policy →
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Learn how National Merit (45%) and South-Western Catchment (35%) quotas function.
            </p>
          </Link>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#0F2942] text-white text-sm font-bold hover:bg-[#163859] transition-colors shadow-sm"
          >
            Return to Homepage
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
