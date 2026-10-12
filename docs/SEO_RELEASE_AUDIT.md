# UNILAG Aggregate Calculator — SEO & AI Search Visibility Release Audit

**Audit Date:** October 11, 2026  
**Phase:** SEO & AI Search Visibility Phase  
**Framework Stack:** Next.js 16.4.0 (Turbopack, App Router), React 19.3.0, TypeScript 5.9.3, Tailwind CSS v4  
**Build Target:** Static Export (`output: 'export'`) in `out/`  
**Operational Cost:** ₦0 / month  
**Automated Tests:** **101 / 101 passing** (11 test suites)  
**TypeScript Typecheck:** **0 compilation errors** (`tsc --noEmit`)  
**Static Routes Generated:** **10 / 10 pre-rendered HTML routes**  

---

## 1. Summary of Implemented Improvements

### 1.1 Centralized Site URL & Domain Hygiene (`src/config/site.ts`)
- **Resolved Domain Fabrication Defect:** Eliminated hardcoded hypothetical domain (`https://unilag-aggregate-calculator.ng`) from `sitemap.ts` and `robots.ts`.
- **Configurable Architecture:** Established `src/config/site.ts` with `getSiteUrl()` and `absoluteUrl()`. In development or staging, if `NEXT_PUBLIC_SITE_URL` is omitted, it safely defaults to `https://unilag-calculator.placeholder.internal`, eliminating risk of indexing unowned domains.

### 1.2 Comprehensive Metadata, Social Sharing & Canonicalization
- **MetadataBase Configured:** Added `metadataBase: new URL(getSiteUrl())` in [`src/app/layout.tsx`](file:///c:/Users/CROWN/Desktop/unilag_agreeate_calculator/src/app/layout.tsx).
- **Title Templates:** Standardized `%s | UNILAG Aggregate Calculator` title template across all pages.
- **Strict Canonical URLs:** Added `alternates: { canonical: ... }` to every page, ensuring clean indexing without duplicate content penalties.
- **Open Graph & Twitter Cards:** Configured comprehensive rich snippets (`og:type`, `og:locale: 'en_NG'`, `og:site_name`, `og:title`, `og:description`, `og:url`, `twitter:card: 'summary_large_image'`).
- **Robots Directives:** Added permissive search bot directives (`index: true, follow: true, googleBot: { max-image-preview: 'large', max-snippet: -1 }`).

### 1.3 Sitemap & Robots Generation
- **XML Sitemap (`src/app/sitemap.ts`):** Dynamically builds valid XML sitemap including all 6 canonical, crawlable routes (`/`, `/how-to-calculate-unilag-aggregate`, `/departmental-cut-off-marks-guide`, `/about`, `/contact`, `/privacy`). Trailing slashes aligned.
- **Robots.txt (`src/app/robots.ts`):** Allows public crawling (`Allow: /`) and dynamically links to `${absoluteUrl('/sitemap.xml')}`.

### 1.4 Structured Data (JSON-LD) Implementations (`src/components/seo/JsonLd.tsx`)
- **WebApplication Schema:** Describes the free, browser-based UNILAG aggregate calculator utility, its zero-cost price (`0 NGN`), browser execution model, and core capabilities.
- **WebSite Schema:** Declares primary site identity and description.
- **Article & TechArticle Schema:** Embedded on educational guides ([`/how-to-calculate-unilag-aggregate`](file:///c:/Users/CROWN/Desktop/unilag_agreeate_calculator/src/app/how-to-calculate-unilag-aggregate/page.tsx), [`/departmental-cut-off-marks-guide`](file:///c:/Users/CROWN/Desktop/unilag_agreeate_calculator/src/app/departmental-cut-off-marks-guide/page.tsx)) with accurate publication dates and publisher details.
- **BreadcrumbList Schema:** Implemented on all subpages to establish clean hierarchical search navigation (`Home > Guide`).

### 1.5 Essential E-E-A-T Trust & Policy Pages
- **`/about` ([`src/app/about/page.tsx`](file:///c:/Users/CROWN/Desktop/unilag_agreeate_calculator/src/app/about/page.tsx)):** Outlines project background, editorial methodology, official source verification standards, and explicit institutional independence.
- **`/contact` ([`src/app/contact/page.tsx`](file:///c:/Users/CROWN/Desktop/unilag_agreeate_calculator/src/app/contact/page.tsx)):** Guides applicants and teachers on how to submit admission circular updates, report calculation discrepancies, and avoid sending sensitive personal pins.
- **`/privacy` ([`src/app/privacy/page.tsx`](file:///c:/Users/CROWN/Desktop/unilag_agreeate_calculator/src/app/privacy/page.tsx)):** Documents the 100% in-browser WebAssembly OCR lifecycle, zero-database architecture, zero tracking cookies, and ephemeral memory revocation.

### 1.6 Custom 404 Recovery Experience (`src/app/not-found.tsx`)
- Replaces generic Next.js fallback with branded recovery screen containing direct navigation cards to the calculator, cut-off directory, scoring guide, and policy guide.

### 1.7 Internal Navigation & Crawlability
- Converted all internal navigation links in `Header.tsx` and `Footer.tsx` from raw `<a>` to Next.js `<Link>`, enabling client prefetching and fast transitions while maintaining crawlable server HTML.

---

## 2. Static Pre-Rendering & HTML Indexability Verification

The production build was verified using `npm.cmd run build`. All 10 static routes prerendered cleanly into `out/`:

```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /about
├ ○ /contact
├ ○ /departmental-cut-off-marks-guide
├ ○ /how-to-calculate-unilag-aggregate
├ ○ /privacy
├ ○ /robots.txt
└ ○ /sitemap.xml
```

### Static Output Audit Highlights:
- **`out/robots.txt`:** Valid `User-Agent: *`, `Allow: /`, pointing to `${sitemapUrl}`.
- **`out/sitemap.xml`:** Valid XML `<urlset>` containing exactly 6 indexable routes without broken links.
- **`out/index.html`:** Verified presence of `<script type="application/ld+json">`, `<link rel="canonical">`, Open Graph metadata, semantic `<main id="main-content">`, `<h1-h3>` headings, and full FAQ content in initial HTML response.
- **`out/about/index.html`:** Full pre-rendered static content with breadcrumbs.
- **`out/contact/index.html`:** Full pre-rendered static content with reporting instructions.
- **`out/privacy/index.html`:** Full pre-rendered static content with OCR privacy guarantee.

---

## 3. Google AI Search & Search Central Readiness

Following Google Search Central's official guidance on generative AI features and AI Overviews:

1. **Pre-rendered, Crawlable Content:** All explanations (the 50:30:20 formula, worked arithmetic examples, O'Level grade point mapping, catchment quota percentages, NIL definition) exist as clean, semantic HTML text readable by Googlebot and LLM crawlers without JavaScript execution delays.
2. **Clear Question-Answer Formats:** The FAQ section and guide headers utilize natural applicant query patterns (`How does UNILAG calculate aggregate score?`, `Can I combine two O'Level sittings?`, `What does NIL mean?`).
3. **Factual Grounding & Source Transparency:** Dates of source circulars (e.g., September 16, 2026 Merit Cut-Offs release) and official university URLs are explicitly cited throughout the copy.
4. **No Fabricated Machine-Readable Metadata:** Schema markup is strictly confined to verified `WebApplication`, `WebSite`, `BreadcrumbList`, and `Article` types matching visible on-page content. No synthetic review stars, fake endorsements, or artificial author claims were created.

---

## 4. Manual Deployment & Setup Checklist (For Site Owner)

When ready to launch on a live custom domain:

1. **Configure Production Domain:**
   - In your Vercel (or static hosting) project settings, set:
     ```bash
     NEXT_PUBLIC_SITE_URL=https://your-custom-domain.com
     ```
   - Re-run the build to update canonical URLs, Open Graph endpoints, and sitemap locations automatically.
2. **Google Search Console Setup:**
   - Add your domain property in [Google Search Console](https://search.google.com/search-console).
   - Verify ownership via DNS TXT record.
   - Submit your sitemap: `https://your-custom-domain.com/sitemap.xml`.
   - Use the **URL Inspection Tool** to test live rendering and request indexing for `/`.
3. **Monitor AI Overviews & Search Appearance:**
   - In Google Search Console, monitor the "Search appearance" filters in the Performance report for AI Overviews and rich snippet impressions.
4. **Social Sharing Image (OG Image):**
   - Place a custom 1200x630 pixel branded preview card at `public/og-image.png` if custom image previews are desired for social feeds.

---

## 5. Test Suite Verification Summary

```bash
npm.cmd test
```
```text
 ✓ tests/ocr/parser.test.ts (11 tests)
 ✓ tests/schema/cutoffDataset.test.ts (8 tests)
 ✓ tests/frontend/calculatorFlow.test.ts (17 tests)
 ✓ tests/unit/calculator.test.ts (16 tests)
 ✓ tests/ocr/integration.test.ts (4 tests)
 ✓ tests/unit/rulesEngine.test.ts (8 tests)
 ✓ tests/unit/validator.test.ts (17 tests)
 ✓ tests/unit/targetCalculator.test.ts (7 tests)
 ✓ tests/integration/sessionWorkflow.test.ts (2 tests)
 ✓ tests/ocr/uploadValidator.test.ts (7 tests)
 ✓ tests/unit/rounding.test.ts (4 tests)

 Test Files  11 passed (11)
      Tests  101 passed (101)
```

```bash
npm.cmd run typecheck
```
```text
> tsc --noEmit
# Exit code 0 (Zero type errors)
```
