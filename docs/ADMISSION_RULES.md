# Official UNILAG Admission Rules & Scoring Research

**Project:** UNILAG Aggregate Calculator  
**Document Status:** Complete (Updated for Phase 2 Implementation)  
**Last Updated:** October 2026  
**Target Sessions Covered:** 2026/2027 (Preliminary/Current), 2025/2026 (Confirmed Historical Baseline)

---

## 1. Executive Summary & Scoring Architecture

Admission into undergraduate degree programmes at the University of Lagos (UNILAG) through the Unified Tertiary Matriculation Examination (UTME) is strictly competitive and merit-driven. The final selection metric is the **Composite Aggregate Score** on a **100-point scale**.

The aggregate score comprises three distinct components:
1. **UTME (JAMB) Examination:** 50% (Max 50.000 points)
2. **Post-UTME Online Screening / Aptitude Test:** 30% (Max 30.000 points)
3. **Senior Secondary School Certificate (O'Level) Results:** 20% (Max 20.000 points)

$$\text{Aggregate Score} = \text{UTME Component (50)} + \text{Post-UTME Component (30)} + \text{O'Level Component (20)}$$

---

## 2. Session Profiles & Verification Safeguards (Phase 2 Resolution)

### 2.1 The 2025/2026 Academic Session: `CONFIRMED`
* **Official Source:** `https://admissions.unilag.edu.ng/notices.html` (Admissions Office, University of Lagos)
* **Confirmed Formula:**
  - UTME: $50\%$ ($\text{Score} / 8$)
  - Post-UTME: $30\%$ ($\text{Score} / 30$)
  - O'Level: $20\%$ ($5 \times \text{grade points}$, where $A1=4.0, B2=3.6, B3=3.2, C4=2.8, C5=2.4, C6=2.0$)
* **Engine Status:** `isCalculationSupported: true`. Active by default in calculation engine.

### 2.2 The 2026/2027 Academic Session: `PRELIMINARY / UNVERIFIED STANDALONE MODALITY`
* **Official Sources:**
  - `https://unilag.edu.ng/important-notice-on-2026-2027-post-utme-screening-exercise/` (Published: June 9, 2026)
  - `https://unilag.edu.ng/unilag-releases-2026-2027-utme-merit-cut-off-marks/` (Published: September 16, 2026)
* **What is Confirmed for 2026/2027:**
  - Minimum UTME eligibility score: 200.
  - O'Level requirements: 5 credits at ONE SITTING ONLY.
  - Compulsory participation in online aptitude screening test.
  - Minimum candidate age: 16 by September 30, 2026.
  - Departmental Merit and Catchment cut-off marks for 112 programmes published on a 100-point scale with up to 3 decimal places.
* **What Remains Unverified for 2026/2027:**
  - UNILAG has **not** released an independent 2026/2027 circular restating the specific grade-to-point mapping. The public notices page still displays *"MODALITIES FOR ASSESSMENT OF 2025/2026 UTME CANDIDATES"*.
* **Implementation Safeguard:**
  - In `src/data/rules/2026_2027.json`, `isCalculationSupported` is set to `false`.
  - The calculation engine strictly rejects 2026/2027 by default with `UNVERIFIED_SESSION` error.
  - It permits calculation only if the caller explicitly supplies `allowPreliminarySession: true`, and the returned result is explicitly tagged with `verificationStatus: "PRELIMINARY"` and warning flags.

---

## 3. Mathematical Formula & Component Specifications

### Component 1: JAMB / UTME Weighting and Conversion
- **Raw Score Range:** 0 to 400 (Integer only; JAMB scores do not contain fractional values).
- **Assigned Weight:** 50% (50.000 maximum points).
- **Mathematical Conversion Formula:**
  $$\text{UTME Points} = \left( \frac{\text{Candidate's UTME Score}}{400} \right) \times 50 = \frac{\text{Candidate's UTME Score}}{8}$$
- **Minimum Eligibility Threshold:** 200 points. Candidates scoring below 200 are flagged as ineligible for Post-UTME screening.
- **Verification Status:** `CONFIRMED`

---

### Component 2: Post-UTME Screening / Aptitude Test
- **Raw Score Range:** 0 to 30 marks (tested as a 30-mark online aptitude test).
- **Assigned Weight:** 30% (30.000 maximum points).
- **Conversion Formula:**
  $$\text{Post-UTME Points} = \text{Raw Post-UTME Score}$$
- **Mandatory Participation:** Participation in the Post-UTME test is compulsory. Candidates who do not participate cannot be considered for admission.
- **Historical Passing Threshold:** 12.0 / 30.0 (40%). Candidates scoring below 12.0 receive a cautionary warning that they historically did not meet the screening pass threshold.
- **Verification Status:** 30% Weight is `CONFIRMED`. 12/30 cutoff is `HISTORICAL ONLY`.

---

### Component 3: Senior Secondary School Certificate (O'Level)
- **Assigned Weight:** 20% (20.000 maximum points).
- **Strict Sitting Requirement:** Candidates must possess credit passes obtained at **ONE SITTING ONLY**. Combined two-sitting results (e.g. WAEC + NECO) are strictly rejected.
- **Grade-to-Point Mapping:**
  - **A1** = 4.0 points ($10 \times 0.4$)
  - **B2** = 3.6 points ($9 \times 0.4$)
  - **B3** = 3.2 points ($8 \times 0.4$)
  - **C4** = 2.8 points ($7 \times 0.4$)
  - **C5** = 2.4 points ($6 \times 0.4$)
  - **C6** = 2.0 points ($5 \times 0.4$)
  - **D7, E8, F9** = 0 points / Fail (awards 0 points and triggers ineligibility warning)
- **Verification Status:** `CONFIRMED` for 2025/2026; `PRELIMINARY` for 2026/2027.

---

## 4. Official Source Registry & Evidence Matrix

| Component / Rule | Admission Session | Official Source URL | Publication Date | Verification Status |
|---|---|---|---|---|
| 50% UTME Weight ($\text{Score} / 8$) | 2025/2026 | `https://admissions.unilag.edu.ng/notices.html` | 2025 | **CONFIRMED** |
| 30% Post-UTME Weight | 2025/2026 | `https://admissions.unilag.edu.ng/notices.html` | 2025 | **CONFIRMED** |
| 20% O'Level Weight | 2025/2026 | `https://admissions.unilag.edu.ng/notices.html` | 2025 | **CONFIRMED** |
| Post-UTME 12/30 (40%) Pass Mark | Historical | Admissions historical guidelines | N/A | **HISTORICAL ONLY** |
| O'Level Grade Scale ($A1=4.0 \dots C6=2.0$) | 2025/2026 | `https://admissions.unilag.edu.ng/notices.html` (source HTML comment) | 2025 | **CONFIRMED (2025/2026)** / **PRELIMINARY (2026/2027)** |
| 1-Sitting O'Level Requirement | 2026/2027 | `https://unilag.edu.ng/important-notice-on-2026-2027-post-utme-screening-exercise/` | June 9, 2026 | **CONFIRMED** |
| Minimum Age 16 by Sept 30 | 2026/2027 | `https://unilag.edu.ng/important-notice-on-2026-2027-post-utme-screening-exercise/` | June 9, 2026 | **CONFIRMED** |
| UTME 200 Minimum Cut-off | 2026/2027 | `https://unilag.edu.ng/important-notice-on-2026-2027-post-utme-screening-exercise/` | June 9, 2026 | **CONFIRMED** |
| Catchment States (6 SW States) | 2026/2027 | `https://unilag.edu.ng/unilag-releases-2026-2027-utme-merit-cut-off-marks/` | Sept 16, 2026 | **CONFIRMED** |
| 2026/2027 Departmental Cut-Off Marks | 2026/2027 | `https://unilag.edu.ng/unilag-releases-2026-2027-utme-merit-cut-off-marks/` | Sept 16, 2026 | **CONFIRMED** |

---

## 5. Reverse Target Calculation Logic

The reverse calculation solves for the exact Post-UTME score required to achieve a target departmental aggregate:
$$\text{Required PUTME} = \text{Target Aggregate} - \left( \frac{\text{UTME}}{8} + \text{O'Level Points} \right)$$

* If $\text{Required PUTME} > 30.0$: Returns `MATHEMATICALLY_IMPOSSIBLE` (cannot be reached even with perfect 30/30).
* If $\text{Required PUTME} \le 0.0$: Returns `ALREADY_SURPASSED` (candidate already meets or exceeds target with UTME and O'Level alone).
* If $0 < \text{Required PUTME} \le 30.0$: Returns `ACHIEVABLE` with exact 3-decimal score needed.
