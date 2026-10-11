# Technical Architecture Design

**Project:** UNILAG Aggregate Calculator  
**Document Status:** Complete (Updated for Phase 2 Implementation)  
**Design Paradigm:** Clean Domain-Driven Architecture with Decoupled Data & SSG

---

## 1. Architectural Goals & Design Philosophy

The architecture of the **UNILAG Aggregate Calculator** is designed around five core principles:

1. **Framework Agnostic Domain Logic:** The calculation engine and validation rules are pure TypeScript functions containing zero UI, DOM, or framework dependencies. They run in any JavaScript/TypeScript runtime.
2. **Session-Decoupled Data:** Departmental cut-off marks and session-specific scoring rules reside in standalone JSON datasets. Introducing a new academic session requires only adding a JSON data file without refactoring application logic.
3. **SEO-First Static Rendering:** Search engines receive fully pre-rendered HTML for all educational pages, departmental directories, and calculator shells (Static Site Generation / SSG).
4. **Resilient Type Safety:** Strict TypeScript interfaces for all inputs, outputs, grading rules, and departmental schemas.
5. **Zero-Overhead Accessibility:** Semantic DOM hierarchy, ARIA live announcement states, and responsive touch targets designed for mobile devices down to 320px width.

---

## 2. Directory & Component Structure

```
unilag_aggregate_calculator/
├── docs/                             # Engineering & Admission Documentation
│   ├── ADMISSION_RULES.md            # Verified rules, formulas, and sources
│   ├── ARCHITECTURE.md               # System design & component contracts
│   ├── PHASE_PLAN.md                 # Multi-phase roadmap and deliverables
│   └── QA_STRATEGY.md                # Test matrix, boundary cases, validation
├── src/
│   ├── core/                         # Pure Domain Engine (Zero UI dependencies)
│   │   ├── types.ts                  # Shared TypeScript interfaces & types
│   │   ├── rounding.ts               # Deterministic 3-decimal precision helpers
│   │   ├── rulesEngine.ts            # Session rules loader & schema validator
│   │   ├── validator.ts              # Boundary guards & eligibility warnings
│   │   ├── calculator.ts             # Composite aggregate calculator
│   │   ├── targetCalculator.ts       # Reverse target score calculator
│   │   └── index.ts                  # Public library exports
│   └── data/                         # Static Datasets (Versioned by Session)
│       ├── rules/
│       │   ├── 2025_2026.json        # Confirmed historical rules config
│       │   └── 2026_2027.json        # Preliminary current session config
│       └── cutoffs/
│           └── 2026_2027.json        # Official 112 departmental cut-offs
└── tests/                            # Automated Vitest Test Suite
    ├── unit/
    │   ├── calculator.test.ts
    │   ├── targetCalculator.test.ts
    │   ├── validator.test.ts
    │   ├── rulesEngine.test.ts
    │   └── rounding.test.ts
    ├── integration/
    │   └── sessionWorkflow.test.ts
    └── schema/
        └── cutoffDataset.test.ts
```

---

## 3. Core Engine Contracts

### 3.1 Input / Output Discrimination
The engine returns discriminated union responses:
```ts
export type AggregateCalculationResponse = AggregateResult | CalculationError;
export type TargetCalculationResponse = TargetCalculationResult | CalculationError;
```

When calculation succeeds:
- `result.success === true`
- Component breakdowns, formatted strings to 3 decimals, and eligibility warnings are returned.

When input validation or session check fails:
- `result.success === false`
- `result.code` contains structured error code (`UNSUPPORTED_SESSION`, `UNVERIFIED_SESSION`, `INVALID_UTME_SCORE`, etc.)
- Clear actionable user-facing error message is returned.

### 3.2 Reverse Target Solving
Given target aggregate $T$:
$$\text{Required PUTME} = T - \left(\frac{\text{UTME}}{8} + \text{O'Level Points}\right)$$
Categorized into:
- `ACHIEVABLE`: $0 < \text{Required PUTME} \le 30.0$
- `ALREADY_SURPASSED`: $\text{Required PUTME} \le 0.0$
- `MATHEMATICALLY_IMPOSSIBLE`: $\text{Required PUTME} > 30.0$

---

## 4. Frontend Architecture & Component Hierarchy (Phase 3)

The user interface is built on **Next.js 16 (App Router)** with **React 19** and **Tailwind CSS v4**, configured for pure Static Site Generation (`output: 'export'`).

### 4.1 Component Hierarchy
```text
RootLayout (src/app/layout.tsx)
└── HomePage (src/app/page.tsx)
    ├── Header (src/components/Header.tsx)
    │   └── Skip-to-content accessibility link & Navigation
    ├── CompactHero (src/components/CompactHero.tsx)
    │   └── Value proposition & formula badge breakdown
    ├── CalculatorContainer [Client] (src/components/CalculatorContainer.tsx)
    │   ├── SessionSelector (src/components/SessionSelector.tsx)
    │   ├── VerificationNotice (src/components/VerificationNotice.tsx)
    │   ├── TargetModeToggle (src/components/TargetModeToggle.tsx)
    │   ├── UtmeInput (src/components/UtmeInput.tsx)
    │   ├── PutmeInput (src/components/PutmeInput.tsx)
    │   ├── OlevelSelector (src/components/OlevelSelector.tsx)
    │   │   └── Dynamic 5-subject vs. 6-subject (Biomedical Eng) matrix
    │   ├── DepartmentCombobox (src/components/DepartmentCombobox.tsx)
    │   │   └── Searchable 112 courses + 37 state selectors
    │   ├── ResultCard (src/components/ResultCard.tsx)
    │   │   └── Live 3-decimal breakdown & screening eligibility checklist
    │   ├── ReverseTargetCard (src/components/ReverseTargetCard.tsx)
    │   │   └── Required Post-UTME score & feasibility status badges
    │   └── DepartmentComparisonCard (src/components/DepartmentComparisonCard.tsx)
    │       └── Merit & Catchment cut-off margin indicators
    ├── DepartmentDirectorySection [Client] (src/components/DepartmentDirectorySection.tsx)
    │   └── Searchable directory of all 112 UNILAG cut-off marks
    ├── ScoringMethodExplanation (src/components/ScoringMethodExplanation.tsx)
    │   └── Comprehensive guide & O'Level grade conversion table
    ├── FaqSection (src/components/FaqSection.tsx)
    │   └── Semantic accordion FAQ with JSON-LD schema
    ├── AdmissionDisclaimer (src/components/AdmissionDisclaimer.tsx)
    │   └── Institutional accuracy & non-affiliation disclosure
    └── Footer (src/components/Footer.tsx)
        └── University portal citations & navigational links
```

### 4.2 State Management & Core Integration
- **Unidirectional Reactive Flow:** The client state coordinator `CalculatorContainer.tsx` holds input state and synchronously delegates all mathematical operations to `src/core/calculator.ts` and `src/core/targetCalculator.ts`.
- **Zero Calculation Duplication:** React components do not perform arithmetic conversions; all point weights, rounding, and validation rules are resolved exclusively within the core domain engine.
- **Dynamic 6-Subject Rule:** If the candidate selects `BIOMEDICAL ENGINEERING`, the calculator activates a 6th subject slot and sets `requiredSubjectCount = 6`. The engine scales O'Level points proportionately ($total \times 5/6$) to cap at 20.000 max points.
- **Preliminary Session Guard:** When `2026/2027` is selected, calculations are paused until the user explicitly checks the simulation confirmation box (`allowPreliminarySession: true`). The results are flagged with an amber "PRELIMINARY" badge.
- **Accessibility & Performance:** All dynamic calculation updates are housed in `aria-live="polite"` containers. Form controls use explicit labels, helper descriptions, and ARIA invalid states.

