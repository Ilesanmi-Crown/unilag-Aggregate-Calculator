# Quality Assurance & Testing Strategy

**Project:** UNILAG Aggregate Calculator  
**Document Status:** Complete (Phase 1 Baseline)  
**Target:** High-Precision, High-Trust Educational Web Application

---

## 1. Overview & Quality Objectives

Because prospective university applicants make critical academic and life decisions based on their admission projections, accuracy and trust are non-negotiable. An incorrect calculation or misleading admission assurance damages user trust and undermines site authority.

### Quality Objectives
1. **Mathematical Accuracy:** 100% precision in composite score calculations matching UNILAG Admissions Office results.
2. **Deterministic Precision:** Strict handling of IEEE 754 floating-point arithmetic to prevent rounding errors (e.g. `0.1 + 0.2 = 0.30000000000000004`).
3. **Robust Input Validation:** Immediate and intuitive rejection of invalid, out-of-range, or non-conforming inputs.
4. **Transparent Communication:** Explicit disclaimers separating mathematical aggregate scores from institutional admission decisions.
5. **Universal Accessibility:** Flawless usability across mobile devices, screen readers, and low-bandwidth connections.

---

## 2. Calculation Test Strategy & Test Matrix

The calculation engine evaluates three components:
$$\text{Aggregate} = \left( \frac{\text{UTME}}{8} \right) + \text{PUTME} + \text{O'Level Points}$$

### 2.1 Test Cases: Standard Combinations

| Test ID | UTME Score (Raw) | PUTME Score (Raw) | O'Level Grades (5 Subjects) | Expected UTME Pts | Expected PUTME Pts | Expected O'Level Pts | Expected Total Aggregate |
|---|---|---|---|---|---|---|---|
| `TC-CALC-001` | 400 | 30.0 | A1, A1, A1, A1, A1 | 50.000 | 30.000 | 20.000 | **100.000** |
| `TC-CALC-002` | 320 | 25.0 | A1, B2, B3, C4, C5 | 40.000 | 25.000 | 16.000 | **81.000** |
| `TC-CALC-003` | 280 | 22.5 | B2, B2, B3, B3, C4 | 35.000 | 22.500 | 16.400 | **73.900** |
| `TC-CALC-004` | 200 | 15.0 | C6, C6, C6, C6, C6 | 25.000 | 15.000 | 10.000 | **50.000** |
| `TC-CALC-005` | 335 | 27.0 | A1, A1, B2, B2, B3 | 41.875 | 27.000 | 18.400 | **87.275** |
| `TC-CALC-006` | 247 | 18.25 | B3, C4, C4, C5, C6 | 30.875 | 18.250 | 13.200 | **62.325** |
| `TC-CALC-007` | 311 | 24.3 | A1, B2, C4, C5, C6 | 38.875 | 24.300 | 14.800 | **77.975** |

### 2.2 Floating-Point & Precision Guard
In JavaScript/TypeScript:
- Direct floating-point addition can result in unexpected fractional values (e.g. `41.875 + 27.0 + 18.4 = 87.27500000000002`).
- **QA Specification:** All calculations must internally operate on fixed-point integers (multiplied by 1,000) or format outputs using deterministic precision helpers:
  ```ts
  export function formatScore(value: number): string {
    return (Math.round((value + Number.EPSILON) * 1000) / 1000).toFixed(3);
  }
  ```
- Automated unit tests must assert string equivalence to 3 decimal places without rounding drift.

---

## 3. Input Validation & Boundary Cases

### 3.1 UTME Input Validation

| Test ID | Input Value | Expected Validation Behavior | Error Message / UI State |
|---|---|---|---|
| `TC-VAL-UTME-01` | `null` / empty | Field required | "Please enter your UTME score." |
| `TC-VAL-UTME-02` | `-5` | Rejection (Below 0) | "UTME score cannot be negative." |
| `TC-VAL-UTME-03` | `150` | Accepted input, but flagged with eligibility warning | "Warning: Minimum UTME score required for UNILAG Post-UTME registration is 200. You are ineligible to apply." |
| `TC-VAL-UTME-04` | `199` | Warning triggered | "Score below 200 threshold for UNILAG screening." |
| `TC-VAL-UTME-05` | `200` | Valid boundary | Valid. Eligibility badge displayed: "Meets minimum UTME requirement." |
| `TC-VAL-UTME-06` | `400` | Valid upper boundary | Valid. |
| `TC-VAL-UTME-07` | `401` | Rejection (Above 400) | "UTME score cannot exceed 400." |
| `TC-VAL-UTME-08` | `270.5` | Rejection / Rounding (JAMB scores are integers) | "UTME score must be a whole number." |
| `TC-VAL-UTME-09` | `"abc"` / Special Chars | Non-numeric rejection | "Please enter a valid numeric score." |

### 3.2 Post-UTME Input Validation

| Test ID | Input Value | Expected Validation Behavior | Error Message / UI State |
|---|---|---|---|
| `TC-VAL-PUTME-01` | empty (in standard mode) | Rejection | "Please enter your Post-UTME score." |
| `TC-VAL-PUTME-02` | `< 0` | Rejection | "Post-UTME score cannot be negative." |
| `TC-VAL-PUTME-03` | `0` | Valid boundary (Missed test / 0 score) | "A score of 0 does not meet the minimum screening pass mark." |
| `TC-VAL-PUTME-04` | `11.5` | Valid input, historical pass warning | "Warning: Historically, scores below 12/30 (40%) do not meet the screening pass threshold." |
| `TC-VAL-PUTME-05` | `12.0` | Valid input | Meets historical threshold. |
| `TC-VAL-PUTME-06` | `30.0` | Valid upper boundary | Maximum possible Post-UTME score. |
| `TC-VAL-PUTME-07` | `30.1` | Rejection (Above 30) | "Post-UTME score cannot exceed 30." |

### 3.3 O'Level Input Validation

| Test ID | Scenario | Expected Validation Behavior | Error Message / UI State |
|---|---|---|---|
| `TC-VAL-OLVL-01` | Only 4 subjects selected | Incomplete | "Exactly five (5) relevant O'Level subjects must be provided." |
| `TC-VAL-OLVL-02` | Duplicate subject selected | Rejection | "Subject '{Subject}' is selected more than once." |
| `TC-VAL-OLVL-03` | Non-qualifying grade (D7, E8, F9) selected | Warning / Ineligibility | "UNILAG requires a minimum of Credit (C6) in all 5 subjects. Grade {Grade} does not qualify." |
| `TC-VAL-OLVL-04` | Two sittings toggled | Warning / Ineligibility | "UNILAG strictly requires all 5 credits to be obtained at ONE sitting. Two sittings are not accepted." |
| `TC-VAL-OLVL-05` | Missing English or Mathematics | Program warning | "English Language and Mathematics are compulsory for this programme." |

---

## 4. Reverse Target Calculator Test Cases

The "Target Mode" calculates the required Post-UTME score to meet a specified departmental cut-off:
$$\text{Required PUTME} = \text{Target Cut-Off} - \left( \frac{\text{UTME}}{8} + \text{O'Level Points} \right)$$

| Test ID | Target Department Cut-off | UTME Score | O'Level Points | Target PUTME Needed | Expected Output / State |
|---|---|---|---|---|---|
| `TC-TGT-01` | Medicine (83.425) | 320 (40.0 pts) | 20.0 pts | 23.425 | "You need at least 23.425 / 30 in Post-UTME to meet the 2026/2027 Merit Cut-Off." |
| `TC-TGT-02` | Comp Sci (82.050) | 350 (43.75 pts) | 18.4 pts | 19.900 | "You need at least 19.900 / 30 in Post-UTME." |
| `TC-TGT-03` | Law (79.125) | 210 (26.25 pts) | 12.0 pts | 40.875 | Unattainable alert: "The required Post-UTME score (40.875) exceeds the maximum possible score (30.000). Reaching this cut-off is mathematically impossible with your current UTME and O'Level scores." |
| `TC-TGT-04` | Education Bio (57.400) | 310 (38.75 pts) | 19.2 pts | -0.550 | Achieved threshold alert: "Your existing UTME and O'Level points (57.950) already exceed the target cut-off (57.400). You only need to obtain the minimum required Post-UTME pass mark." |

---

## 5. Cut-Off Comparison & Catchment Testing

### 5.1 Departmental Cut-Off Matching Logic

Given candidate aggregate $A$ and departmental cut-off $C$:
- **Clear Pass:** $A \ge C + 1.0$ (High confidence match)
- **Competitive Margin:** $C \le A < C + 1.0$ (Marginal qualification; depends on annual quota shifts)
- **Below Cut-off:** $A < C$ (Does not meet historical benchmark)
- **"NIL" Cut-off:** Department has no quota or no qualifying candidates under that category; display educational advisory explaining "NIL" status.

### 5.2 Catchment State Routing Logic
- If candidate state $\in \{\text{Ekiti}, \text{Lagos}, \text{Ogun}, \text{Ondo}, \text{Osun}, \text{Oyo}\}$:
  - Compare first against Merit cut-off.
  - If below Merit, compare against candidate's specific state Catchment cut-off.
- If candidate state $\notin \{\text{Ekiti}, \dots, \text{Oyo}\}$ (All other states):
  - Compare exclusively against Merit cut-off.
  - Display informative notification: *"Your state ({State}) is evaluated under the National Merit quota."*

---

## 6. Regression Testing & Automation

### 6.1 Test Suite Organization (Vitest)
```
tests/
├── unit/
│   ├── aggregateCalculator.test.ts  # Core math, scaling, decimal precision
│   ├── olevelConverter.test.ts      # Grade point mappings, subject counting
│   ├── targetCalculator.test.ts     # Reverse target calculation logic
│   └── validators.test.ts           # Boundary and type validation
├── integration/
│   ├── departmentLookup.test.ts     # Matching aggregate to cut-off datasets
│   └── catchmentRouting.test.ts     # State of origin vs merit/catchment logic
└── schema/
    └── cutoffSchema.test.ts         # Validate 2026/2027 and 2025/2026 JSON integrity
```

### 6.2 Pre-Release Verification Protocol
Before any deployment or version release, the CI pipeline must pass:
1. `npm test`: 100% unit and integration test pass rate.
2. `npm run lint`: Zero ESLint / formatting errors.
3. `npm run build`: Zero build errors or broken route links.
4. Schema validation check verifying that all departmental cut-offs contain numerical or "NIL" entries with zero unparsed strings.

---

## 7. Official Source Verification Requirements

1. **Annual Audit Trigger:** When UNILAG Admissions Office releases new academic session circulars (typically May–October), all new documents must be retrieved and archived.
2. **Archival Location:** Raw text and snapshots stored in `docs/sources/` or verified repository logs with exact retrieval dates.
3. **No Unverified Data Promotion:** No blog posts, forums, or third-party websites can be used as sources for departmental cut-offs. Every data point in `data/cutoffs/` must trace to an official `unilag.edu.ng` announcement.
