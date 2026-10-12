import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-10 mt-16 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-800">
          {/* Column 1: About & Trust */}
          <div className="space-y-2">
            <span className="font-bold text-white text-sm block">
              UNILAG Aggregate Calculator
            </span>
            <p className="text-slate-400 text-xs leading-relaxed">
              An independent, privacy-first admission score projection tool designed for Nigerian secondary school students, UTME candidates, and parents.
            </p>
            <div className="pt-2 flex items-center space-x-3 text-xs text-slate-300">
              <Link href="/about" className="hover:text-white underline">
                About Project
              </Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-white underline">
                Contact & Feedback
              </Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-white underline">
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Column 2: Official Portals */}
          <div className="space-y-2">
            <span className="font-bold text-white text-sm block">
              Official University Portals
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a
                  href="https://unilag.edu.ng/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors underline focus-ring rounded"
                >
                  University of Lagos Main Website ↗
                </a>
              </li>
              <li>
                <a
                  href="https://admissions.unilag.edu.ng/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors underline focus-ring rounded"
                >
                  UNILAG Admissions Office Portal ↗
                </a>
              </li>
              <li>
                <a
                  href="https://applications.unilag.edu.ng/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors underline focus-ring rounded"
                >
                  UNILAG Applications Portal ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Admissions Guides & Citations */}
          <div className="space-y-2">
            <span className="font-bold text-white text-sm block">
              Admissions Guides & Policies
            </span>
            <ul className="space-y-1.5">
              <li>
                <Link
                  href="/how-to-calculate-unilag-aggregate"
                  className="hover:text-white transition-colors underline focus-ring rounded"
                >
                  How to Calculate Aggregate Score
                </Link>
              </li>
              <li>
                <Link
                  href="/departmental-cut-off-marks-guide"
                  className="hover:text-white transition-colors underline focus-ring rounded"
                >
                  Departmental Cut-Off Marks Guide
                </Link>
              </li>
            </ul>
            <p className="text-slate-400 text-xs leading-relaxed pt-2">
              Scoring weights derived from verified 2025/2026 circular. Departmental cut-off benchmark records sourced from official September 16, 2026 press release.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-500 text-[11px]">
          <p>
            © {new Date().getFullYear()} UNILAG Aggregate Calculator. Open-source educational utility.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="hover:text-slate-300 underline">
              Privacy Guarantee
            </Link>
            <span>•</span>
            <Link href="/about" className="hover:text-slate-300 underline">
              Methodology
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-slate-300 underline">
              Report Correction
            </Link>
          </div>
        </div>
        <p className="text-slate-500 text-[10px] text-center sm:text-left">
          Independent educational resource. Not officially affiliated with, sponsored by, or endorsed by the University of Lagos or JAMB.
        </p>
      </div>
    </footer>
  );
};
