# Project Phase Plan: UNILAG Aggregate Calculator

**Project:** UNILAG Aggregate Calculator  
**Document Status:** Complete (Phase 2 Completed)  
**Target Environment:** Modern, SEO-optimized, static/serverless web platform

---

## 1. Overview and Engineering Principles

The **UNILAG Aggregate Calculator** is designed as a high-authority, trustworthy, and lightning-fast web tool for prospective University of Lagos undergraduate candidates. Development is organized into six structured phases.

### Core Principles
1. **Mathematical Invariance:** Calculation logic is decoupled from UI and backed by 100% test coverage.
2. **Data Decoupling:** Departmental cut-off marks and session-specific rules are stored in clean JSON datasets, never hardcoded in component logic.
3. **No False Promises:** Clear educational UX distinguishing basic eligibility from final departmental cut-offs.
4. **Performance & Accessibility First:** Zero layout shift, instant calculation, mobile-friendly tap targets, and WCAG 2.1 AA compliance.
5. **SEO & Content Authority:** Comprehensive structured data, programmatic departmental guides, and evergreen educational content.

---

## 2. Multi-Phase Roadmap

```mermaid
flowchart LR
    P1[Phase 1: Research & Foundation (Done)] --> P2[Phase 2: Domain Engine & Data (Done)]
    P2 --> P3[Phase 3: Interactive UI & A11y]
    P3 --> P4[Phase 4: SEO & Content Hub]
    P4 --> P5[Phase 5: Audits & Hardening]
    P5 --> P6[Phase 6: Launch & Maintenance]
```

---

### Phase 1: Research and Project Foundation (Completed)
- **Status:** Done.
- Audited official UNILAG sources, cataloged eligibility criteria, established architecture and QA strategy.

---

### Phase 2: Domain Engine, Schemas & Unit Testing (Completed)
*Objective: Build the pure TypeScript calculation engine, data schemas, and comprehensive test suite.*

- **Scope & Deliverables:**
  - `src/core/types.ts`: Strict TypeScript interfaces for candidate inputs, O'Level grade points, calculation results, and cut-off benchmarks.
  - `src/core/rounding.ts`: IEEE 754 precision protection and 3-decimal formatting.
  - `src/core/rulesEngine.ts`: Session rules provider validating schema at runtime.
  - `src/core/validator.ts`: Comprehensive input boundary guards and eligibility warnings.
  - `src/core/calculator.ts`: Pure forward aggregate calculation engine ($UTME / 8 + PUTME + O'Level$).
  - `src/core/targetCalculator.ts`: Reverse target calculator.
  - `src/data/rules/2025_2026.json`: Verified historical modalities.
  - `src/data/rules/2026_2027.json`: Preliminary current session config (opt-in required).
  - `src/data/cutoffs/2026_2027.json`: Official 112 programme cut-off marks dataset.
  - `tests/`: 62 automated tests in Vitest across 7 test files.
- **Acceptance Criteria:**
  - [x] Domain engine has 100% test coverage for calculation logic.
  - [x] Zero floating-point rounding bugs (deterministic 3-decimal precision).
  - [x] Validation guards prevent illegal inputs (UTME < 0 or > 400, grades below C6 flagged, Post-UTME > 30).
  - [x] Cut-off datasets strictly validate against JSON schemas.
  - [x] TypeScript checks pass with zero errors (`tsc --noEmit`).

---

### Phase 3: Frontend Scaffolding, Accessible UI & Interactive Calculator (Completed)
*Objective: Build an accessible, high-performance, mobile-first web interface using Next.js 16, React 19, and Tailwind CSS.*

- **Scope & Deliverables:**
  - [x] Next.js 16 App Router stack configured with pure static export (`output: 'export'`).
  - [x] Academic utility aesthetic (#0F2942 navy accent, high-contrast, compact hero, zero fake affiliations).
  - [x] Full suite of interactive, accessible calculator components:
    - [x] `UtmeInput`: Integer 0–400 validation with <200 threshold alerts.
    - [x] `PutmeInput`: 0–30 validation with historical pass mark (<12.0) notices.
    - [x] `OlevelSelector`: 5-subject picker, grade points, duplicate prevention, and dynamic 6th subject for Biomedical Engineering.
    - [x] `TargetModeToggle`: Forward calculation vs. Reverse Target score calculator.
    - [x] `DepartmentCombobox`: Searchable 112 courses, faculty badges, and 37-state catchment detection.
    - [x] `ResultCard`: 3-decimal precision breakdown, screening checklist, and `aria-live="polite"` feedback.
    - [x] `ReverseTargetCard`: Required Post-UTME computation with status badges (`ACHIEVABLE`, `ALREADY_SURPASSED`, `MATHEMATICALLY_IMPOSSIBLE`).
    - [x] `DepartmentComparisonCard`: Real-time margin vs Merit and Catchment thresholds.
    - [x] `DepartmentDirectorySection`: Full filterable directory of all 112 published departmental cut-offs.
    - [x] `ScoringMethodExplanation`: 50:30:20 formula explanation and grade points table.
    - [x] `FaqSection`: Semantic accordion FAQ with rich Schema.org JSON-LD.
    - [x] `AdmissionDisclaimer` & `Footer`: Prominent independent disclaimers and official UNILAG portal citations.
  - [x] Automated frontend test suite: 17 tests added (total 79 tests passing).
  - [x] Production build verified with zero errors (`npm run build`).

---

### Phase 4: Data Audit, SEO, and Production Readiness (Completed)
*Objective: Full audit of calculations, cut-off datasets, technical SEO architecture, and educational content.*

- **Scope & Deliverables:**
  - [x] Biomedical Engineering scaling formula audit: Removed unverified `5/6` scaling formula, enforced official 5-subject engine, added prerequisite advisory notice.
  - [x] Cut-off dataset audit: Full audit of 112 programmes in `src/data/cutoffs/2026_2027.json` documented in `docs/CUTOFF_AUDIT.md`.
  - [x] Technical SEO & Structured Data: Pure static export, sitemap.xml, robots.txt, factual Open Graph and WebApplication metadata.
  - [x] Educational Content Pages:
    - [x] `/how-to-calculate-unilag-aggregate`: Detailed step-by-step scoring formula walkthrough.
    - [x] `/departmental-cut-off-marks-guide`: Explaining National Merit vs South-West Catchment policies.
  - [x] Release Audit: Documented findings, verification status, and risks in `docs/RELEASE_AUDIT.md`.
  - [x] Verification: 79 passing tests, 0 TypeScript errors, 100% clean static production export.

---

### Phase 5: Performance Optimization, Audits & Production Hardening
*Objective: Optimize Core Web Vitals, audit accessibility, and harden client-side resilience.*

---

### Phase 6: Production Deployment, Monitoring & Annual Maintenance
*Objective: Deploy to production edge infrastructure and establish operational procedures for annual admissions updates.*
