import React from 'react';
import { Header } from '../components/Header';
import { CompactHero } from '../components/CompactHero';
import { CalculatorContainer } from '../components/CalculatorContainer';
import { DepartmentDirectorySection } from '../components/DepartmentDirectorySection';
import { ScoringMethodExplanation } from '../components/ScoringMethodExplanation';
import { FaqSection } from '../components/FaqSection';
import { AdmissionDisclaimer } from '../components/AdmissionDisclaimer';
import { Footer } from '../components/Footer';

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main-content" className="flex-1">
        <CompactHero />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          {/* Main Interactive Calculator */}
          <CalculatorContainer />

          {/* Departmental Cut-Off Marks Directory */}
          <DepartmentDirectorySection />

          {/* Scoring Methodology Explanation */}
          <ScoringMethodExplanation />

          {/* Frequently Asked Questions */}
          <FaqSection />

          {/* Institutional Disclaimer */}
          <AdmissionDisclaimer />
        </div>
      </main>
      <Footer />
    </>
  );
}
