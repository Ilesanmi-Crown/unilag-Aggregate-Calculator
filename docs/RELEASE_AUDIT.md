# UNILAG Aggregate Calculator — Phase 4 Release Audit

**Audit Date:** October 11, 2026  
**Status:** Release Candidate Verified (RC-1.0.0)  
**Lead Auditor:** Senior Full-Stack, Technical SEO & QA Engineering Team  
**Repository:** `https://github.com/Ilesanmi-Crown/unilag-Aggregate-Calculator.git`

---

## 1. What Was Inspected

1. **Scoring Engine & Rules:**
   - UTME integer range validation ($0 \le \text{UTME} \le 400$) and scaling formula ($\text{UTME} / 8$).
   - Post-UTME validation ($0 \le \text{PUTME} \le 30.0$) and historical pass mark threshold warning ($< 12.0$).
   - O'Level mapping ($A1=4.0 \dots C6=2.0$, strictly 1 sitting, 5 relevant subjects).
   - Session-specific safeguards separating confirmed 2025/2026 rules from preliminary 2026/2027 modalities.
   - Biomedical Engineering calculation path and subject requirements.
   - IEEE 754 precision and 3-decimal rounding policies.
   - Reverse target calculator feasibility classification (`ACHIEVABLE`, `ALREADY_SURPASSED`, `MATHEMATICALLY_IMPOSSIBLE`).
2. **Departmental Cut-Off Dataset (`src/data/cutoffs/2026_2027.json`):**
   - All 112 published programmes across 18 faculties cross-verified against official University of Lagos press release of September 16, 2026.
   - National Merit scores and Catchment scores for all 6 South-Western states (Ekiti, Lagos, Ogun, Ondo, Osun, Oyo).
   - Strict representation of official "NIL" entries as `null` (zero-coercion prevention).
3. **Institutional and Eligibility Disclaimers:**
   - Non-affiliation notices in Header, Footer, Calculator Container, and educational guides.
   - Clear distinction between eligibility requirements (e.g. 200 JAMB minimum) and departmental cut-off marks.
   - Clear disclosure that historical cut-offs do not guarantee future admission.
4. **Technical SEO & Accessibility:**
   - Static Site Generation (SSG) with Next.js 16 App Router.
   - Prerendered `sitemap.xml` and `robots.txt`.
   - Semantic HTML5 structure, ARIA live regions for calculation updates, and skip-to-content links.
   - Creation of dedicated educational content guides (`/how-to-calculate-unilag-aggregate` and `/departmental-cut-off-marks-guide`).

---

## 2. Defects Discovered & Fixed

1. **Biomedical Engineering Unverified Scaling Formula (CRITICAL DEFECT):**
   - *Discovery:* The interface previously required 6 subjects for Biomedical Engineering and applied an unverified `total * 5/6` scaling formula to force 6 subjects into the 20-point boundary.
   - *Audit Finding:* While UNILAG's undergraduate admissions brochure lists 6 prerequisite subjects (including Further Mathematics) for qualifying eligibility, UNILAG has **never officially published a 6-subject scoring or 5/6 scaling formula**. UNILAG's aggregate scoring formula officially evaluates the candidate's best 5 relevant credit subjects.
   - *Fix:* Removed the unverified `5/6` scaling formula. Enforced the verified 5-subject scoring engine across all programmes. Added a prominent contextual prerequisite notice in the UI for Biomedical Engineering candidates explaining the distinction between 6-subject eligibility prerequisites and 5-subject aggregate scoring.
2. **NIL Cut-Off Presentation (DATA DEFECT):**
   - *Audit Finding:* Verified that 5 programmes (Landscape Architecture, Interior Architecture, Linguistics/Igbo, Education Igbo, Education Geography) have official "NIL" designations in UNILAG's release.
   - *Fix:* Ensured all `null` values are strictly preserved and rendered as neutral `NIL` badges, preventing accidental coercion to `0` or `0.000`.
3. **Cross-Page Anchor Navigation (UX/ROUTING DEFECT):**
   - *Discovery:* Header links used `#section` fragments which broke when navigating from educational sub-pages.
   - *Fix:* Updated navigation targets to `/#section` and added direct navigation to the new educational guides.
4. **Import Path Resolution in Next.js Bundler:**
   - *Discovery:* Component imports contained `.js` extensions which caused Turbopack module resolution errors in Next.js bundler mode.
   - *Fix:* Converted to extensionless TypeScript imports across `src/components/`, `src/app/`, and `src/core/`.

---

## 3. Admission-Rule Verification Status

| Rule / Modality | Session Applicable | Status | Implementation Details |
|---|---|---|---|
| **UTME 50% Weight ($\text{Score} / 8$)** | 2025/2026, 2026/2027 | **CONFIRMED** | Evaluated on integer score $0 \le \text{UTME} \le 400$. Minimum threshold 200 flags screening ineligibility. |
| **Post-UTME 30% Weight** | 2025/2026, 2026/2027 | **CONFIRMED** | Raw score out of 30.0 marks. Scores $< 12.0$ trigger historical advisory. |
| **O'Level 20% Weight (5 credits)** | 2025/2026 | **CONFIRMED** | $A1=4.0, B2=3.6, B3=3.2, C4=2.8, C5=2.4, C6=2.0$. Non-credit grades ($D7, E8, F9$) award 0 points. Strictly 1 sitting. |
| **O'Level Mapping Standalone Circular** | 2026/2027 | **PRELIMINARY** | Standalone circular not yet published for current session. Engine pauses calculation by default; requires explicit simulation opt-in checkbox (`allowPreliminarySession: true`). |
| **Departmental Cut-Off Marks (112 courses)** | 2026/2027 | **CONFIRMED** | Officially released September 16, 2026 by UNILAG Admissions Office. |
| **Catchment States Allocation** | 2026/2027 | **CONFIRMED** | 6 South-Western states (Ekiti, Lagos, Ogun, Ondo, Osun, Oyo). |

---

## 4. Cut-Off Dataset Audit Statistics

- **Total Programmes Checked:** 112
- **Faculties Covered:** 18
- **Officially Verified Records:** 112 (100%)
- **Confirmed Mismatches:** 0
- **Numeric Merit Cut-Offs:** 107
- **Official "NIL" Merit Cut-Offs:** 5
- **Numeric Catchment Points:** 410
- **Official "NIL" Catchment Points:** 262
- **Full audit report:** Available at [`docs/CUTOFF_AUDIT.md`](file:///c:/Users/CROWN/Desktop/unilag_agreeate_calculator/docs/CUTOFF_AUDIT.md).

---

## 5. Technical SEO Improvements

- **Static Site Generation:** 100% pre-rendered HTML across all routes.
- **Dedicated Content Pages:**
  - [`/how-to-calculate-unilag-aggregate`](file:///c:/Users/CROWN/Desktop/unilag_agreeate_calculator/src/app/how-to-calculate-unilag-aggregate/page.tsx): In-depth guide explaining the mathematical steps and formulas.
  - [`/departmental-cut-off-marks-guide`](file:///c:/Users/CROWN/Desktop/unilag_agreeate_calculator/src/app/departmental-cut-off-marks-guide/page.tsx): Explaining National Merit vs Catchment policies and official NIL designations.
- **Sitemap & Robots:** Valid static `sitemap.xml` and `robots.txt` dynamically generated and exported into `/out`.
- **Structured Data:** Factual JSON-LD for WebApplication and FAQPage.

---

## 6. Accessibility & UX Findings

- **Keyboard Navigability:** Fully tested with visible focus rings (`focus-ring` utility) on all inputs, buttons, and links.
- **Screen Reader Support:** Screen reader skip-link included at top of every page. Dynamic calculation updates housed in `aria-live="polite"` containers.
- **Contrast & Legibility:** Navy accent (`#0F2942`) on white/light-gray backgrounds exceeds WCAG AAA contrast ratio standards.

---

## 7. Verification & Build Results

- **Vitest Suite:** **79 passing tests (100%)** across 8 test suites.
- **TypeScript Typecheck:** `npm run typecheck` passed with **0 errors**.
- **Static Production Build:** `npm run build` completed successfully, exporting 7 static routes to `out/`.

---

## 8. Deployment Prerequisites & Remote Git Repository

- **Target Remote:** `https://github.com/Ilesanmi-Crown/unilag-Aggregate-Calculator.git`
- **Output Artifacts:** Ready for static deployment to GitHub Pages, Cloudflare Pages, Netlify, or Vercel.
