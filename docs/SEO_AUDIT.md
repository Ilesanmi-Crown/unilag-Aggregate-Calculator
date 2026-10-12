# UNILAG Aggregate Calculator — SEO & AI Search Visibility Audit

**Audit Date:** October 11, 2026  
**Auditor:** Senior Software & Technical SEO Engineer  
**Framework Stack:** Next.js 16.4.0 (Turbopack, App Router), React 19.3.0, TypeScript 5.9.3, Tailwind CSS v4  
**Hosting / Export Model:** Static Export (`output: 'export'`) for Vercel / Static CDN Hosting  
**Status:** Baseline Completed  

---

## 1. Executive Summary

This repository contains a high-precision, client-side UNILAG Aggregate Calculator and supporting educational guides. The application has a strong technical foundation: 101/101 passing Vitest tests, pure TypeScript scoring logic, zero server dependencies, and fast static generation.

However, several critical technical SEO, metadata, structured data, and trust architecture gaps prevent optimal search indexing and AI discoverability in Google Search, Google AI Overviews, and AI Mode. Most critically, an unverified production domain (`https://unilag-aggregate-calculator.ng`) was previously hardcoded into the sitemap and robots routes, violating production configuration hygiene.

This audit details the current state, catalogs all discovered issues, and ranks recommended remediations by business impact.

---

## 2. Current State Inventory

| Component | Current Implementation | Status |
| :--- | :--- | :--- |
| **Framework & Router** | Next.js 16.4.0 App Router with `output: 'export'` | Healthy (Static HTML generation verified) |
| **Prerendered Routes** | `/`, `/how-to-calculate-unilag-aggregate`, `/departmental-cut-off-marks-guide` | 3 content routes + 404 fallback |
| **Root Metadata** | Basic `title`, `description`, `keywords`, `authors`, `robots` in `layout.tsx` | Partial (Missing `metadataBase`, Open Graph, Twitter cards, title template) |
| **Canonical URLs** | None configured on any page | **Critical Gap** |
| **Domain Configuration** | Hardcoded `https://unilag-aggregate-calculator.ng` in `sitemap.ts` and `robots.ts` | **Critical Defect** (Invented domain) |
| **XML Sitemap** | `src/app/sitemap.ts` (3 routes) | Valid format, but uses hardcoded domain and trailing-slash mismatch |
| **Robots Configuration** | `src/app/robots.ts` | Disallows `/api/` (unnecessary on static export) and hardcodes domain |
| **Structured Data (JSON-LD)** | Completely absent (0 schema tags) | **High Impact Gap** (No `WebApplication`, `WebSite`, `Article`, `BreadcrumbList`) |
| **Error Handling (404)** | Default Next.js fallback | Suboptimal (No custom navigation, internal links, or brand layout) |
| **Trust Pages** | About, Contact/Feedback, Privacy Policy missing | **High Impact Gap** (Missing essential E-E-A-T signals) |
| **Internal Navigation** | Header/Footer use raw `<a>` tags and omit key trust pages | Moderate (Crawlable, but lacks client prefetching and trust links) |
| **Mobile & Accessibility** | Responsive layout, semantic form controls, skip link present | Strong foundation; minor contrast and aria refinements needed |

---

## 3. Discovered Problems & Deficiencies

### 3.1 Critical Issues (Must Fix Immediately)

1. **Hardcoded Hypothetical Domain in Sitemap and Robots:**
   - `src/app/sitemap.ts` and `src/app/robots.ts` reference `https://unilag-aggregate-calculator.ng`.
   - *Impact:* The project does not currently own or deploy to this domain. Publishing this domain creates broken canonical references and causes search engines to index non-existent target hosts.
   - *Fix:* Introduce a central site configuration helper (`src/core/siteConfig.ts` or `src/config/site.ts`) driven by `process.env.NEXT_PUBLIC_SITE_URL` with a clearly documented fallback placeholder (`https://unilag-calculator.placeholder.internal`).

2. **Absence of Canonical URL Declarations:**
   - None of the pages specify `alternates: { canonical: '...' }`.
   - *Impact:* Search engines cannot determine canonical versions of pages, risking duplicate content penalties when queries append parameters or when accessed across varying hostnames.

3. **Missing `metadataBase` in Root Layout:**
   - Next.js requires `metadataBase` to resolve relative URLs for canonicals, Open Graph images, and Twitter cards. Without it, Next.js generates build-time warnings and drops relative social tags.

### 3.2 High Impact Issues

4. **Missing Open Graph & Twitter Social Sharing Metadata:**
   - Pages lack `openGraph` (`og:title`, `og:description`, `og:url`, `og:site_name`, `og:locale`, `og:type`) and `twitter` (`card: 'summary_large_image'`).
   - *Impact:* Snippets shared on WhatsApp, Telegram, X (Twitter), LinkedIn, and Facebook display unformatted text or broken previews, drastically reducing click-through rates among Nigerian students and parents.

5. **Complete Absence of Schema.org Structured Data (JSON-LD):**
   - The calculator has no `WebApplication` schema.
   - The educational guides have no `Article` or `BreadcrumbList` schema.
   - *Impact:* Search engines cannot parse semantic capabilities (free, browser-based, calculation application, no download required) or breadcrumb hierarchy.

6. **Missing Essential E-E-A-T Trust Pages:**
   - Prospective applicants need to know:
     - Who created the calculator and how data is vetted (`/about`).
     - How candidate data and scanned images are handled (`/privacy`).
     - How to report admission rule changes, cut-off corrections, or bugs (`/contact`).
   - *Impact:* Google's helpful content guidelines place heavy emphasis on transparency, independent operation disclaimers, and clear contact channels for educational and civic utility tools.

7. **Missing Custom 404 Not-Found Experience:**
   - Attempting to load an invalid URL displays the bare Next.js black-and-white 404 page.
   - *Impact:* Lost crawl budget, increased bounce rate, and poor user experience when prospective students follow outdated links.

### 3.3 Moderate Impact Issues

8. **Navigation Links Bypassing Next.js Client Routing:**
   - `Header.tsx` and `Footer.tsx` use raw HTML `<a>` tags rather than Next.js `<Link>`.
   - *Impact:* Full-page reloads occur on internal page transitions instead of instant soft navigation.

9. **Sitemap Trailing Slash Mismatch:**
   - `sitemap.ts` defines URLs with trailing slashes (e.g. `/how-to-calculate-unilag-aggregate/`), whereas Next.js App Router default pages are resolved without trailing slashes.
   - *Impact:* Canonical redirection hops can waste crawl budget.

---

## 4. Prioritized Action Plan

| Priority | Category | Action Item | Target File(s) |
| :--- | :--- | :--- | :--- |
| **P0** | **Config** | Centralize domain configuration via `NEXT_PUBLIC_SITE_URL` | `src/config/site.ts` |
| **P0** | **Technical** | Add `metadataBase`, title template, canonical tags, and Open Graph | `src/app/layout.tsx`, page files |
| **P0** | **Crawling** | Correct `sitemap.ts` and `robots.ts` with central domain helper and consistent URLs | `src/app/sitemap.ts`, `src/app/robots.ts` |
| **P1** | **Trust** | Create verified `/about`, `/privacy`, and `/contact` pages | `src/app/about/page.tsx`, `src/app/privacy/page.tsx`, `src/app/contact/page.tsx` |
| **P1** | **Structured Data**| Implement valid JSON-LD (`WebApplication`, `WebSite`, `Article`, `BreadcrumbList`) | `src/components/seo/JsonLd.tsx` |
| **P1** | **UX / Crawl** | Build custom, helpful `not-found.tsx` page | `src/app/not-found.tsx` |
| **P2** | **Navigation** | Convert Header & Footer navigation to `<Link>` and include trust page links | `src/components/Header.tsx`, `src/components/Footer.tsx` |
| **P2** | **Content** | Create `docs/SEO_CONTENT_PLAN.md` with keyword intent mapping | `docs/SEO_CONTENT_PLAN.md` |
| **P3** | **Verification**| Run test suite, verify static export HTML, and generate `docs/SEO_RELEASE_AUDIT.md` | Build scripts & audit doc |

---

## 5. Items Requiring a Real Production Domain or Manual Account Setup

The following items **cannot** be completed automatically in this environment and must be configured when a production domain is purchased and hosted:

1. **Domain Selection & DNS Configuration:**
   - Purchase and point a custom domain (e.g. `unilagcalculator.com` or `unilagaggregate.ng`) to Vercel/Cloudflare Pages.
   - Set the environment variable `NEXT_PUBLIC_SITE_URL=https://your-actual-domain.com` in your deployment dashboard.
2. **Google Search Console Verification:**
   - Add the domain property in Google Search Console via DNS TXT record or HTML tag.
   - Submit the live sitemap URL: `https://your-actual-domain.com/sitemap.xml`.
   - Request indexing for core pages once live.
3. **Google Search AI Mode / AI Overviews Inclusion Verification:**
   - In Google Search Console, monitor the "Search appearance" and "Performance" reports for impressions stemming from AI-driven search experiences.
4. **Bing Webmaster Tools & IndexNow Setup:**
   - Submit the sitemap to Bing Webmaster Tools for indexation across Bing and Microsoft Copilot.
5. **Real Social Preview Asset:**
   - Design and place an authentic 1200x630 Open Graph preview image at `/og-image.png`.
6. **Physical / Digital Contact Channels:**
   - Provide an authentic email or GitHub repository issues link on the `/contact` page for user inquiries and discrepancy reports.

---

## 6. Safety & Accuracy Constraints

- **No Fabricated Admissions Data:** Scoring engine weights, grade mappings ($A1=4.0 \dots C6=2.0$), and cutoff records remain strictly derived from verified official UNILAG sources.
- **No False Official Claims:** The platform retains prominent, inescapable disclaimers clarifying that it is an independent educational tool, not an official arm of the University of Lagos or JAMB.
- **No Keyword Stuffing or Spun Pages:** Every page published provides genuine, readable, and original educational value to prospective students. No duplicate near-identical programmatic pages will be created.
