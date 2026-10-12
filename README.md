# UNILAG Aggregate Calculator

A high-precision, production-grade calculation engine and web platform designed to help prospective University of Lagos (UNILAG) applicants calculate their undergraduate UTME admission aggregate score, explore reverse target score requirements, understand scoring modalities, and compare results against officially published departmental cut-off marks.

---

## 📌 Project Overview

* **Target Audience:** Nigerian secondary school leavers, UTME candidates, parents, and education counselors seeking admission into UNILAG.
* **Core Value:** 100% verified official calculation formulas, zero misleading admission guarantees, crystal-clear eligibility notices, and historical/current departmental cut-off mark comparison.
* **Engineering Standard:** Pure TypeScript calculation engine, zero external runtime dependencies, 100% unit-tested with Vitest, strict IEEE 754 precision protection, and separation of rules from cut-off datasets.

---

## 🚦 Current Status: SEO & AI Search Visibility Phase Completed

The SEO & AI Search Visibility Phase delivers a complete technical SEO foundation, structured data, trust pages, and AI search discoverability without compromising performance or accuracy:
1. **Configurable Base Domain Architecture:** Eliminated invented domains. Centralized site URL resolution via `NEXT_PUBLIC_SITE_URL` with a documented placeholder fallback (`https://unilag-calculator.placeholder.internal`).
2. **Comprehensive Metadata & Social Sharing:** Standardized title templates, canonical tags on all indexable pages, Open Graph previews (`og:locale: 'en_NG'`), Twitter cards, and search bot directives.
3. **Structured Data (JSON-LD):** Implemented schema.org `WebApplication` (free educational app), `WebSite`, `Article`, and `BreadcrumbList` matching visible on-page content without synthetic reviews.
4. **Essential E-E-A-T Trust Pages:** Added dedicated, verified pages for [`/about`](file:///c:/Users/CROWN/Desktop/unilag_agreeate_calculator/src/app/about/page.tsx) (mission and methodology), [`/contact`](file:///c:/Users/CROWN/Desktop/unilag_agreeate_calculator/src/app/contact/page.tsx) (error reporting and security notices), and [`/privacy`](file:///c:/Users/CROWN/Desktop/unilag_agreeate_calculator/src/app/privacy/page.tsx) (100% in-browser OCR privacy guarantee).
5. **Custom 404 Recovery Experience:** Branded, accessible [`/not-found`](file:///c:/Users/CROWN/Desktop/unilag_agreeate_calculator/src/app/not-found.tsx) page with direct recovery links to the calculator, cut-off directory, and scoring guides.
6. **Optimized Sitemap & Robots:** Static `sitemap.xml` (all 6 indexable canonical routes) and `robots.txt` generated automatically during export.
7. **Google AI Search Readiness:** Pre-rendered semantic text, structured Q&A formats, and authoritative source citations with dates for AI Overviews and AI Mode eligibility.
8. **Static Export Verified:** All 10 routes prerendered in `out/` with **101 / 101 automated tests passing** and 0 TypeScript compilation errors.

---

## 🏛 Session Profiles & Verification Status

| Session | Verification Status | Calculation Supported | Description & Official Source |
|---|---|---|---|
| **2025/2026** | **`CONFIRMED`** | **Yes (Active)** | Modalities verified via `https://admissions.unilag.edu.ng/notices.html`. UTME 50%, PUTME 30%, O'Level 20% ($A1=4.0 \dots C6=2.0$). |
| **2026/2027** | **`PRELIMINARY`** | **Opt-in Only** | Eligibility requirements and cut-offs confirmed (`https://unilag.edu.ng/`). However, a standalone 2026/2027 modalities circular with explicit grade mapping has not been formally released on public channels. Disabled by default; callers must provide `allowPreliminarySession: true` to simulate using inherited rules. |

---

## 📚 Project Documentation

All specifications, official source citations, and engineering strategies are documented under [`docs/`](file:///c:/Users/CROWN/Desktop/unilag_agreeate_calculator/docs/):

* **[Admission Rules & Research (`docs/ADMISSION_RULES.md`)](file:///c:/Users/CROWN/Desktop/unilag_agreeate_calculator/docs/ADMISSION_RULES.md)**
* **[System Architecture Design (`docs/ARCHITECTURE.md`)](file:///c:/Users/CROWN/Desktop/unilag_agreeate_calculator/docs/ARCHITECTURE.md)**
* **[Phase Plan & Roadmap (`docs/PHASE_PLAN.md`)](file:///c:/Users/CROWN/Desktop/unilag_agreeate_calculator/docs/PHASE_PLAN.md)**
* **[Quality Assurance & Testing Strategy (`docs/QA_STRATEGY.md`)](file:///c:/Users/CROWN/Desktop/unilag_agreeate_calculator/docs/QA_STRATEGY.md)**
* **[Image Interpreter Architecture Plan (`docs/IMAGE_INTERPRETER_PLAN.md`)](file:///c:/Users/CROWN/Desktop/unilag_agreeate_calculator/docs/IMAGE_INTERPRETER_PLAN.md)**
* **[Image Interpreter Technical Guide (`docs/IMAGE_INTERPRETER.md`)](file:///c:/Users/CROWN/Desktop/unilag_agreeate_calculator/docs/IMAGE_INTERPRETER.md)**
* **[SEO Audit & Discovery Findings (`docs/SEO_AUDIT.md`)](file:///c:/Users/CROWN/Desktop/unilag_agreeate_calculator/docs/SEO_AUDIT.md)**
* **[SEO Content & Keyword Strategy Plan (`docs/SEO_CONTENT_PLAN.md`)](file:///c:/Users/CROWN/Desktop/unilag_agreeate_calculator/docs/SEO_CONTENT_PLAN.md)**
* **[SEO & AI Search Visibility Release Audit (`docs/SEO_RELEASE_AUDIT.md`)](file:///c:/Users/CROWN/Desktop/unilag_agreeate_calculator/docs/SEO_RELEASE_AUDIT.md)**

---

## 🛠 Project Structure

```
unilag_aggregate_calculator/
├── src/
│   ├── core/
│   │   ├── types.ts              # Strict TypeScript interfaces & schemas
│   │   ├── rounding.ts           # IEEE 754 precision & 3-decimal formatting
│   │   ├── rulesEngine.ts        # Session registry & runtime config validator
│   │   ├── validator.ts          # Input boundary guards & warnings
│   │   ├── calculator.ts         # Pure forward aggregate calculation engine
│   │   ├── targetCalculator.ts   # Reverse target calculator
│   │   └── index.ts              # Public library exports
│   └── data/
│       ├── rules/
│       │   ├── 2025_2026.json    # Confirmed historical modalities
│       │   └── 2026_2027.json    # Preliminary current session config
│       └── cutoffs/
│           └── 2026_2027.json    # 112 official departmental cut-offs
├── tests/
│   ├── unit/
│   │   ├── calculator.test.ts    # Forward calculation & known-answer matrix
│   │   ├── targetCalculator.test.ts # Reverse target mode & boundaries
│   │   ├── validator.test.ts     # Input boundary & format validation
│   │   ├── rulesEngine.test.ts   # Config validation & session isolation
│   │   └── rounding.test.ts      # Floating-point precision tests
│   ├── integration/
│   │   └── sessionWorkflow.test.ts # Catchment concession & cutoff matching
│   └── schema/
│       └── cutoffDataset.test.ts # Schema integrity & official benchmark tests
├── tsconfig.json
└── package.json
```

---

## 🚀 Development, Build & Testing Commands

### Start Local Development Server
```bash
npm run dev
```
Accessible at `http://localhost:3000`.

### Build Static Production Export
```bash
npm run build
```
Generates 100% pre-rendered HTML, CSS, JavaScript, and metadata in the `out/` directory.

### Run Automated Tests (Vitest)
```bash
npm test
```
Executes all 101 unit, schema, integration, OCR, and UI workflow tests.

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Strict TypeScript Typecheck
```bash
npm run typecheck
```

---

## ⚖️ Disclaimer

The **UNILAG Aggregate Calculator** is an independent educational tool. It is not officially affiliated with, endorsed by, or sponsored by the University of Lagos. Aggregate calculations are estimates based on officially published university assessment modalities. Official admissions decisions and annual cut-off marks are determined exclusively by the University of Lagos.
