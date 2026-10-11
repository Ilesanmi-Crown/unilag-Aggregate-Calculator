import React from 'react';

const FAQS = [
  {
    question: 'How does UNILAG calculate aggregate score for UTME candidates?',
    answer: 'The University of Lagos calculates undergraduate admission aggregate using a 50:30:20 weighted system: UTME Score is divided by 8 (yielding up to 50 points); the Post-UTME online aptitude test contributes up to 30 points; and your best five relevant O\'Level credit grades at one sitting contribute up to 20 points (A1=4.0, B2=3.6, B3=3.2, C4=2.8, C5=2.4, C6=2.0). The total maximum aggregate is 100.000 points.'
  },
  {
    question: 'Can I combine two O\'Level sittings (e.g. WAEC and NECO)?',
    answer: 'No. The University of Lagos strictly enforces a single sitting rule for undergraduate UTME admission. Candidates must obtain all five (or six, in the case of Biomedical Engineering) required credit passes at ONE SITTING ONLY. Combined results from two different sittings or different examination bodies are rejected.'
  },
  {
    question: 'Which states are considered Catchment States for UNILAG?',
    answer: 'Under federal admission quota guidelines, UNILAG\'s catchment area comprises the six South-Western states of Nigeria: Ekiti, Lagos, Ogun, Ondo, Osun, and Oyo. Candidates from these states are evaluated first under National Merit, and if they do not meet Merit, they compete for the 35% catchment quota allocated to their specific home state. Candidates from all other 30 states and the FCT compete exclusively on National Merit.'
  },
  {
    question: 'What does "NIL" mean in the official UNILAG cut-off table?',
    answer: '"NIL" indicates that either no candidate from that catchment category qualified for admission in that programme, or no admission quota was allocated or filled for that specific category in that academic session. It does NOT mean the cut-off was zero.'
  },
  {
    question: 'What is the minimum JAMB / UTME score to be eligible for UNILAG?',
    answer: 'The official minimum eligibility threshold is 200 points in UTME. Candidates who score 199 or below cannot apply for the UNILAG Post-UTME screening exercise, regardless of their O\'Level grades.'
  },
  {
    question: 'Does achieving a previous cut-off score guarantee my admission?',
    answer: 'No. Published departmental cut-off marks are historical benchmarks determined by the quality of applicant scores and available faculty capacities in a specific session. Annual cut-off marks fluctuate based on applicant performance and NUC quota constraints.'
  }
];

export const FaqSection: React.FC = () => {
  return (
    <section id="faq-section" aria-labelledby="faq-title" className="space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <h2 id="faq-title" className="text-xl sm:text-2xl font-extrabold text-[#0F2942] tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Essential clarifications regarding UNILAG admission screening and scoring.
        </p>
      </div>

      <div className="space-y-2.5">
        {FAQS.map((faq, idx) => (
          <details
            key={idx}
            className="group bg-white border border-slate-200 rounded-lg p-4 transition-all open:ring-1 open:ring-[#0F2942] open:border-[#0F2942]"
          >
            <summary className="font-bold text-sm text-slate-900 cursor-pointer list-none flex items-center justify-between gap-3 focus-ring rounded">
              <span>{faq.question}</span>
              <span className="text-slate-400 group-open:rotate-180 transition-transform font-mono text-base shrink-0">
                ▾
              </span>
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
};
