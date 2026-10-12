# UNILAG Aggregate Calculator — Image Interpreter Architecture & Implementation Plan

**Phase:** Phase 5 — Free Browser-Based Result Image Interpreter  
**Author:** Engineering Team  
**Status:** Approved for Implementation  
**Budget:** ₦0 (Strict Free-Tier / Client-Side Architecture)  
**Target Deployment:** Static Export (`output: 'export'`) on Vercel  

---

## 1. Executive Summary & Objective

The **UNILAG Aggregate Calculator** requires a zero-cost, privacy-first, in-browser optical character recognition (OCR) interpreter capable of scanning:
1. **JAMB UTME Result Slips** (extracting aggregate score, subject breakdown, exam year).
2. **O'Level Statement of Results** (WAEC, NECO, NABTEB, GCE — extracting 5+ subject names and letter grades $A1$–$F9$).
3. **UNILAG Post-UTME Result Slips** (extracting candidate score out of 30.0).

### Key Architectural Tenets
1. **₦0 Budget & Zero External API Calls:** No proprietary vision models (OpenAI, Google Cloud Vision, AWS Rekognition) or paid microservices. 100% in-browser client execution using `tesseract.js` (WebAssembly & Web Workers).
2. **Zero Bundle Impact for Manual Users:** Dynamic, on-demand code splitting. The OCR engine and Tesseract Web Worker scripts are loaded **only** when a user explicitly initiates an image upload.
3. **No Calculation by OCR:** The OCR layer strictly acts as an input assistant. It extracts text, parses candidate values, flags ambiguities, and hands validated values to the user review interface. Scoring remains solely with the verified pure scoring engine (`src/core/calculator.ts`).
4. **Privacy by Design:** Images are read into memory using browser APIs (`FileReader`, `URL.createObjectURL`), processed inside sandboxed Web Workers, and immediately released (`URL.revokeObjectURL`). Zero telemetry, zero cloud uploads, zero `localStorage` persistence of personal student data.
5. **Human-in-the-Loop Review Screen:** Automated parsing is never applied silently. The user is presented with a pre-populated, fully editable confirmation form highlighting low-confidence fields before applying values to the calculator.

---

## 2. Technical Evaluation: Tesseract.js in Next.js Static Export

### 2.1 Compatibility with Next.js 16 App Router & Static Export
- **Next.js Static Export (`output: 'export'`):** The build creates pure static HTML/JS/CSS in `out/`. There is no Node.js runtime or SSR server in production.
- **Client Boundary (`'use client'`):** All OCR execution, Web Workers, canvas manipulation, and file handling run exclusively in browser client components.
- **SSR Safety:** Tesseract.js access must guard against execution during static prerendering via dynamic imports (`await import('tesseract.js')`) invoked inside user-triggered event handlers or `useEffect`.

### 2.2 Worker & WASM Asset Loading Strategy
Tesseract.js v7 uses a Web Worker executing WebAssembly (`tesseract-core.wasm`) and trained language data (`eng.traineddata.gz`).
- By default, Tesseract.js fetches its worker scripts and traineddata from reputable, fast, public CDNs (jsdelivr / unpkg / github CDN) cached by the browser's Cache API or HTTP cache.
- This ensures zero server bandwidth costs, ₦0 infrastructure overhead, and seamless static hosting on Vercel or any static host.
- Worker termination (`await worker.terminate()`) is invoked on dialog closure or completion to prevent Web Worker memory leaks on mobile devices.

### 2.3 Performance & Device Considerations
- On low-end mobile devices, running Tesseract OCR can take between 2 to 6 seconds depending on resolution.
- To prevent UI jank, all heavy OCR tasks run in background Web Workers off the main UI thread.
- A live progress indicator (0% to 100% with friendly status messages: "Loading recognition models...", "Scanning document text...", "Parsing academic records...") keeps the user informed.
- A cancellation mechanism terminates the active worker if the user closes the modal during processing.

---

## 3. Security, Privacy & File Validation Architecture

### 3.1 Strict Client-Side File Validation
Before passing any file to the OCR worker or browser canvas:
1. **File Size Limit:** Hard cap at **5 MB** ($5 \times 1024 \times 1024$ bytes). Prevents browser memory exhaustion and tab crashing on mobile devices.
2. **Magic Bytes Validation:** Rather than trusting client file extensions or user-controlled MIME types, the application inspects the first 12 bytes of the raw `ArrayBuffer` via `Uint8Array`:
   - **JPEG:** Starts with `0xFF, 0xD8, 0xFF`
   - **PNG:** Starts with `0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A`
   - **WebP:** Starts with `0x52, 0x49, 0x46, 0x46` (RIFF) and bytes 8–11 equal `0x57, 0x41, 0x56, 0x45` or `0x57, 0x45, 0x42, 0x50` (WEBP)
3. **Graceful Rejection:** Files that fail magic byte checks (e.g. PDFs, disguised executables, corrupted files) are rejected with clear, accessible error messages.

### 3.2 Ephemeral Lifecycle & Data Cleanliness
- Image preview URLs are created via `URL.createObjectURL(file)`.
- When the modal is dismissed or an image is replaced, `URL.revokeObjectURL(url)` is invoked to reclaim browser RAM.
- **No Persistence:** Extracted candidate names, registration numbers, or scores are **never** written to `localStorage`, `sessionStorage`, cookies, or remote tracking services.

---

## 4. Parser Architecture & Disambiguation Rules

OCR text from photographed phone screens or scanned printouts contains noise, misaligned lines, and non-score numbers. The parser module (`src/ocr/parser.ts`) implements pure, resilient pattern matchers.

### 4.1 Candidate Disambiguation & Noise Rejection
Result slips feature several misleading numerical values that must **never** be mistaken for scores:
- **Registration Numbers:** 10 alphanumeric characters (e.g., `202512345678JA`, `10928374AB`).
- **Dates & Timestamps:** `14/05/2025`, `2025-06-12 14:30:22`.
- **Examination Numbers / Centre Numbers:** 7-to-10 digit sequences (e.g., `4010203045`).
- **Serial Numbers / Barcode Numbers:** Long integer strings.

### 4.2 Document Category Parsers

#### Category A: JAMB UTME Result Slip
- **Total Aggregate:**
  - Pattern search: `(?:TOTAL|AGGREGATE|SCORE|UTME\s*SCORE)[^\d]*(\d{2,3})` or scanning 4 subject scores and summing them.
  - Validation boundary: Valid integer $0 \le S \le 400$.
- **Individual Subjects:**
  - Common 4-subject breakdown: `Use of English`, `Mathematics`, `Physics`, `Chemistry`, `Biology`, `Economics`, `Literature`, `Government`, `CRS`, `IRS`, `Commerce`, `Accounting`.
  - Individual subject scores: $0 \le s \le 100$.
  - Disambiguation: If individual subjects sum to the detected total, high confidence is assigned.
- **Candidate Name (Optional):**
  - Heuristic search for lines starting with `NAME:`, `CANDIDATE NAME:`, or formatted `SURNAME, FIRSTNAME OTHERNAME`. Flagged with low confidence if ambiguous.
- **Exam Year:**
  - 4-digit year matching `202[0-9]`.

#### Category B: O'Level Statement of Results (WAEC / NECO / NABTEB / GCE)
- **Subject Matching Dictionary:**
  - Standardized subject database mapping aliases:
    - `"ENG" | "ENGLISH" | "ENGLISH LANG"` $\rightarrow$ `"English Language"`
    - `"MATH" | "MATHEMATICS" | "GEN MATH"` $\rightarrow$ `"Mathematics"`
    - `"PHYS" | "PHYSICS"` $\rightarrow$ `"Physics"`
    - `"CHEM" | "CHEMISTRY"` $\rightarrow$ `"Chemistry"`
    - `"BIO" | "BIOLOGY"` $\rightarrow$ `"Biology"`
    - `"F/MATH" | "FURTHER MATH" | "ADD MATH"` $\rightarrow$ `"Further Mathematics"`
    - `"AGR" | "AGRIC" | "AGRICULTURAL SCI"` $\rightarrow$ `"Agricultural Science"`
    - `"ECON" | "ECONOMICS"` $\rightarrow$ `"Economics"`
    - `"GOVT" | "GOVERNMENT"` $\rightarrow$ `"Government"`
    - `"LIT" | "LIT IN ENG" | "LITERATURE"` $\rightarrow$ `"Literature in English"`
    - `"CRK" | "CRS" | "CHRISTIAN REL"` $\rightarrow$ `"CRS"`
    - `"IRK" | "IRS" | "ISLAMIC REL"` $\rightarrow$ `"IRS"`
    - `"CIVIC" | "CIVIC EDU"` $\rightarrow$ `"Civic Education"`
    - `"COMM" | "COMMERCE"` $\rightarrow$ `"Commerce"`
    - `"ACC" | "ACCOUNTING" | "FINANCIAL ACC"` $\rightarrow$ `"Financial Accounting"`
    - `"GEO" | "GEOGRAPHY"` $\rightarrow$ `"Geography"`
    - `"TECH DRAW" | "TECHNICAL DRAWING"` $\rightarrow$ `"Technical Drawing"`
- **Grade Detection:**
  - Strict matching against valid UNILAG recognized grades: `A1, B2, B3, C4, C5, C6, D7, E8, F9`.
  - Handling OCR OCR confusions (e.g. `Al` $\rightarrow$ `A1`, `B3` $\rightarrow$ `B3`, `C` followed by `b` $\rightarrow$ `C6`).
- **Exam Body & Year:**
  - Detection of `WAEC`, `WASSCE`, `NECO`, `NABTEB`, `GCE`.
  - Year extracted (`2020`–`2026`).

#### Category C: UNILAG Post-UTME Result Slip
- **Score out of 30.0:**
  - Pattern search: `(?:POST[-\s]*UTME|P-UTME|SCORE|AGGREGATE)[^\d]*(\d{1,2}(?:\.\d{1,3})?)\s*(?:\/\s*30)?`
  - Validation boundary: $0.0 \le S \le 30.0$.
  - Maximum possible score explicit constant: `30.000`.

### 4.3 Category Mismatch & Quality Verification
- If user chooses "JAMB UTME" but uploads a WAEC result with subject grades $A1$–$F9$, parser alerts user: *"The uploaded document appears to be an O'Level certificate rather than a JAMB slip. Would you like to switch categories?"*
- If OCR returns empty text or gibberish (e.g., extremely blurry or dark photo), clear feedback is shown: *"Could not clearly detect text. Please upload a brighter, non-blurry image or enter your scores manually."*

---

## 5. User Interface & Interactive Workflow

```
[ Calculator Page ]
       │
       ▼ [ "Upload Result Slip" Button ]
┌────────────────────────────────────────────────────────┐
│ Modal: Step 1 - Choose Category & Upload Image         │
│  - Categories: JAMB UTME | O'Level | UNILAG Post-UTME  │
│  - Drag & Drop zone (JPEG, PNG, WebP <= 5MB)           │
│  - Privacy Notice ("Processed locally in browser")    │
└────────────────────────────────────────────────────────┘
       │ [ File Selected ]
┌────────────────────────────────────────────────────────┐
│ Modal: Step 2 - Local OCR Processing                   │
│  - Live progress bar (0% - 100%)                       │
│  - Status: "Initializing engine... Scanning text..."   │
│  - Cancel button (terminates worker, revokes memory)   │
└────────────────────────────────────────────────────────┘
       │ [ Text Extracted & Parsed ]
┌────────────────────────────────────────────────────────┐
│ Modal: Step 3 - Human Review & Disambiguation Screen   │
│  - Side-by-side or collapsible image thumbnail preview │
│  - Editable fields for all detected values             │
│  - Amber warning badges on uncertain/inferred fields   │
│  - Ability to add/remove/change subjects & grades      │
│  - "Confirm & Apply to Calculator" button              │
└────────────────────────────────────────────────────────┘
       │ [ Confirmed ]
┌────────────────────────────────────────────────────────┐
│ Calculator Container State Updated                     │
│  - UTME score updated                                  │
│  - Post-UTME score updated                             │
│  - 5 O'Level subjects populated                        │
│  - Pure calculation engine computes aggregate score    │
└────────────────────────────────────────────────────────┘
```

---

## 6. Directory Structure & Modular File Map

```
src/
├── ocr/
│   ├── types.ts          # Extracted interfaces, categories, validation types
│   ├── validator.ts      # 5MB size limit & magic bytes image validation
│   ├── engine.ts         # Lazy-loaded Tesseract worker wrapper & progress dispatcher
│   └── parser.ts         # Pure regex/heuristic parsing & noise rejection
├── components/
│   ├── ocr/
│   │   ├── ResultUploadModal.tsx  # Main modal: category selector, dropzone, progress
│   │   ├── OcrReviewForm.tsx      # Interactive review form with uncertainty alerts
│   │   └── OcrPrivacyNotice.tsx   # Prominent 100% in-browser privacy guarantee badge
│   └── CalculatorContainer.tsx    # Integrated trigger & state binder
tests/
└── ocr/
    ├── uploadValidator.test.ts    # Size and magic byte security tests
    ├── parser.test.ts             # UTME, O'Level, Putme parsing, noise rejection
    └── integration.test.ts        # Review-to-calculator state handoff tests
```

---

## 7. Automated Testing Plan

1. **Validator Tests (`tests/ocr/uploadValidator.test.ts`):**
   - Valid JPEG (`FF D8 FF`), PNG (`89 50 4E 47`), WebP magic bytes accepted.
   - Files exceeding 5MB strictly rejected.
   - Text files, HTML files, or executables disguised as `.jpg` rejected by magic bytes.
2. **Parser Tests (`tests/ocr/parser.test.ts`):**
   - JAMB slip parsing: Total score extraction, 4 subject scores, registration numbers ignored, phone numbers ignored.
   - O'Level parsing: Subject name normalization, letter grades $A1$–$F9$ matched, examination board identified.
   - Post-UTME parsing: Scores out of 30.0 extracted, invalid boundary checks ($> 30$) handled.
   - Category mismatch detection (e.g., WAEC document uploaded under JAMB category).
   - Ambiguity & uncertainty scoring: low-confidence items correctly tagged.
3. **Integration Flow Tests (`tests/ocr/integration.test.ts`):**
   - Application of parsed UTME/O'Level data into the existing calculator state without modifying scoring rules or session policies.
   - Preservation of existing manual inputs when user cancels review.

---

## 8. Verification Criteria

- [x] Full TypeScript typecheck passes with 0 errors (`npm.cmd run typecheck`).
- [x] All existing 79 tests + new OCR tests pass (`npm.cmd test`).
- [x] Static export production build completes cleanly (`npm.cmd run build`), generating output in `out/`.
- [x] No server routes, APIs, or database connections introduced.
- [x] ₦0 operational cost achieved.
