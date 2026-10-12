# UNILAG Result Image Interpreter (OCR) — Technical Specification & Operational Guide

**Module:** Browser-Based Result Image Interpreter  
**Phase:** Phase 5  
**Engine:** Tesseract.js (WASM / Web Worker Client Execution)  
**Budget:** ₦0 (Strict Zero-Cost Infrastructure)  
**Deployment Target:** Next.js Static Export (`output: 'export'`) on Vercel  

---

## 1. Architectural Overview & Objective

The **UNILAG Result Image Interpreter** is an optional client-side helper designed to streamline student data entry. Rather than manually typing JAMB UTME totals, subject breakdowns, Post-UTME screening marks, or five O'Level subject grades, prospective candidates can upload a photograph or screenshot of their official result slip.

### Key Architectural Tenets
1. **₦0 Operating Cost:** Zero third-party paid APIs (no Google Cloud Vision, AWS Rekognition, or OpenAI endpoints). All character recognition occurs locally within the candidate's browser via WebAssembly (WASM) and Web Workers.
2. **Zero Bundle Bloat for Manual Users:** Tesseract.js and its underlying language models are dynamically imported (`import('tesseract.js')`) strictly on demand when a user initiates a scan. Manual calculator users download zero OCR JavaScript.
3. **Strict Separation Between OCR and Scoring:** The OCR interpreter is strictly an extraction assistant. It does **not** evaluate aggregate points, apply formulas, or decide candidate eligibility. All extracted credentials flow through a human confirmation screen before being handed to the immutable calculation engine (`src/core/calculator.ts`).
4. **Guaranteed Privacy by Design:** Uploaded documents remain exclusively in local browser RAM. No images, extracted text, candidate names, or examination records are transmitted across the network, stored in databases, or persisted in browser storage (`localStorage` / `sessionStorage`).

---

## 2. Supported Result Categories & Extracted Entities

### A. JAMB UTME Result Slip
- **Total UTME Score:** 0–400 integer score extracted via explicit score anchors (`AGGREGATE SCORE`, `TOTAL SCORE`, `UTME SCORE`) or inferred by summing the 4 detected subject scores.
- **Subject Scores:** Standard 4-subject breakdown (e.g., Use of English, Mathematics, Physics, Chemistry) bounded between 0 and 100.
- **Examination Session / Year:** 4-digit calendar year (e.g. `2025`).
- **Candidate Name:** Identified via prefix anchors (`CANDIDATE NAME:`, `SURNAME:`).
- **Noise Rejection:** 10-digit JAMB registration numbers (e.g., `202519283748JA`), centre numbers (e.g., `4010203045`), exam timestamps (`14/05/2025 09:30:15 AM`), and Nigerian phone numbers (`080...`, `+234...`) are strictly excluded from score detection.

### B. O'Level Statement of Results (WAEC / NECO / NABTEB / GCE)
- **Subject Normalization:** Canonical dictionary matching variations (e.g., `GEN MATH`, `GENERAL MATHEMATICS` $\rightarrow$ `Mathematics`; `ENG LANG` $\rightarrow$ `English Language`; `F/MATHS` $\rightarrow$ `Further Mathematics`).
- **Grade Detection:** Strict recognition of UNILAG-admissible letter grades: $A1, B2, B3, C4, C5, C6, D7, E8, F9$. Handles character glitches (e.g. `Al` $\rightarrow$ `A1`, `O6` $\rightarrow$ `C6`).
- **Exam Body & Year:** Identifies examining body (`WAEC`, `NECO`, `NABTEB`, `GCE`) and calendar year.
- **5-Subject Requirement Notice:** Flags an advisory if fewer than five subjects are detected.

### C. UNILAG Post-UTME Result Slip
- **Screening Score (0.000 – 30.000):** Anchored to screening keywords (`POST-UTME SCORE`, `P-UTME`, `SCREENING SCORE`, `... / 30`).
- **Max Score Constant:** Explicitly scaled out of 30.000 points.
- **Score Disambiguation:** Distinguishes the Post-UTME screening mark ($\le 30.0$) from the UTME score ($> 100$) printed on the same institutional slip.

---

## 3. Security, Privacy & File Validation

### 3.1 Client-Side File Validation (`src/ocr/validator.ts`)
Before passing any file to the OCR worker or browser canvas:
1. **File Size Enforcement:** Hard cap at **5.00 MB** ($5 \times 1024 \times 1024$ bytes) to protect mobile devices from out-of-memory crashes.
2. **Magic Byte Signature Inspection:** Validates the first 12 raw bytes via `Uint8Array` rather than trusting MIME types or extensions:
   - **JPEG:** `FF D8 FF`
   - **PNG:** `89 50 4E 47 0D 0A 1A 0A`
   - **WebP:** RIFF (`52 49 46 46`) and WEBP (`57 45 42 50`)
3. **Corrupt File Defense:** Non-image files (PDFs, HTML files, binaries) are rejected immediately with user-facing guidance.

### 3.2 Ephemeral Resource Management
- Image preview URLs created via `URL.createObjectURL(file)` are explicitly revoked via `URL.revokeObjectURL(url)` on dialog dismissal, image re-selection, or unmount.
- Web Worker threads are explicitly terminated (`await worker.terminate()`) upon completion or user cancellation.

---

## 4. User Interaction & Disambiguation Flow

```
[ Manual Calculator View ]
            │
            ▼ [ "Scan Result Slip" Pill Button ]
┌────────────────────────────────────────────────────────┐
│ Modal: Category Selection & Image Dropzone             │
│ - Choose: JAMB UTME | O'Level Certificate | Post-UTME  │
│ - Drag & drop or pick image (<= 5MB, JPEG/PNG/WebP)    │
│ - Embedded Privacy Guarantee Notice                    │
└────────────────────────────────────────────────────────┘
            │ [ File Uploaded & Validated ]
┌────────────────────────────────────────────────────────┐
│ Modal: In-Browser Processing                           │
│ - Progress bar: 0% → 100% with friendly status updates │
│ - User cancellation button (immediately aborts worker) │
└────────────────────────────────────────────────────────┘
            │ [ Text Parsed & Extracted ]
┌────────────────────────────────────────────────────────┐
│ Modal: Human-in-the-Loop Review Screen                 │
│ - Collapsible image thumbnail preview                  │
│ - Editable inputs for all extracted scores and grades  │
│ - Amber alerts for low confidence or discrepancies     │
│ - "Confirm & Apply to Calculator" button               │
└────────────────────────────────────────────────────────┘
            │ [ Confirmed ]
┌────────────────────────────────────────────────────────┐
│ Calculator Container State Updated                     │
│ - Field values populate input state                    │
│ - Success notification displayed with dismiss button   │
│ - Pure scoring engine evaluates aggregate score        │
└────────────────────────────────────────────────────────┘
```

---

## 5. Directory & File Reference

| File | Purpose |
| :--- | :--- |
| `src/ocr/types.ts` | Strict TypeScript domain models, confidence levels, extracted schemas |
| `src/ocr/validator.ts` | 5 MB limit & magic byte binary validators |
| `src/ocr/engine.ts` | Dynamic Tesseract.js worker runner with cancellation and progress reporting |
| `src/ocr/parser.ts` | Pure regex and heuristic parsing engine with noise rejection |
| `src/components/ocr/OcrPrivacyNotice.tsx` | Transparent in-browser privacy guarantee UI badge |
| `src/components/ocr/OcrReviewForm.tsx` | Interactive, editable review form with side-by-side verification |
| `src/components/ocr/ResultUploadModal.tsx` | Accessible dialog with category switcher and progress monitor |
| `src/components/CalculatorContainer.tsx` | Main page integration trigger and state receiver |
| `tests/ocr/uploadValidator.test.ts` | Vitest suite for binary signatures and size boundary tests |
| `tests/ocr/parser.test.ts` | Vitest suite for UTME, O'Level, Post-UTME regex parsing & noise rejection |
| `tests/ocr/integration.test.ts` | Vitest suite for end-to-end extracted data to calculator aggregate scoring |

---

## 6. Automated Testing Verification

Run the complete test suite:
```bash
npm test
```
**Results:**
- **11 / 11 Test Suites Passed**
- **101 / 101 Tests Passed** (including 22 dedicated OCR validator, parser, and engine integration tests)
- **TypeScript:** 0 compilation errors (`npm run typecheck`)
- **Static Export:** 7 / 7 static routes prerendered cleanly into `out/` (`npm run build`)
