# UNILAG Aggregate Calculator

A high-precision, production-grade calculation engine and web platform designed to help prospective University of Lagos (UNILAG) applicants calculate their undergraduate UTME admission aggregate score, explore reverse target score requirements, understand scoring modalities, and compare results against officially published departmental cut-off marks.

---

## 📌 Project Overview

* **Target Audience:** Nigerian secondary school leavers, UTME candidates, parents, and education counselors seeking admission into UNILAG.
* **Core Value:** 100% verified official calculation formulas, zero misleading admission guarantees, crystal-clear eligibility notices, and historical/current departmental cut-off mark comparison.
* **Engineering Standard:** Pure TypeScript calculation engine, zero external runtime dependencies, 100% unit-tested with Vitest, strict IEEE 754 precision protection, and separation of rules from cut-off datasets.

---

## 🚦 Current Status: Phase 4 Completed (Data Audit, SEO & Release Candidate)

Phase 4 has audited the entire platform, corrected unverified calculation paths, and established an SEO-ready static release:
1. **Audited & Verified Calculation Engine:** Enforced verified 5-subject O'Level scoring. Removed unverified Biomedical Engineering `5/6` scaling formula, replacing it with an explicit prerequisite eligibility advisory.
2. **Comprehensive Cut-Off Audit (`docs/CUTOFF_AUDIT.md`):** All 112 published programmes in `src/data/cutoffs/2026_2027.json` reconciled against official September 16, 2026 UNILAG release. Zero mismatches; official "NIL" values preserved as `null`.
3. **Dedicated Educational SEO Guides:**
   - `/how-to-calculate-unilag-aggregate`: In-depth walkthrough of the 50:30:20 composite scoring formula.
   - `/departmental-cut-off-marks-guide`: National Merit vs South-Western Catchment quota policies explainer.
4. **Technical SEO Architecture:** Fully pre-rendered static HTML, sitemap.xml, robots.txt, and factual JSON-LD metadata.
5. **Release Audit (`docs/RELEASE_AUDIT.md`):** Complete documentation of findings, verification statuses, and deployment readiness.
6. **Automated Test Suite:** 79 automated tests passing across 8 test suites with 0 TypeScript errors.
7. **Static Export Verified:** 100% pre-rendered in `out/` ready for static hosting.

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
Executes all 79 unit, schema, integration, and UI workflow tests.

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
