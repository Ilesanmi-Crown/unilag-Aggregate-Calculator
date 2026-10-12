/**
 * UNILAG Aggregate Calculator — Central Site & SEO Configuration
 *
 * Configurable base URL and metadata constants.
 * If NEXT_PUBLIC_SITE_URL is not set in the environment, a documented
 * placeholder domain is used to prevent accidental publication of invented domains.
 */

export const PRODUCTION_SITE_URL = 'https://unilag-aggregate-calculator.vercel.app';

/**
 * Returns the sanitized site URL without trailing slashes.
 * Driven by the NEXT_PUBLIC_SITE_URL environment variable, defaulting
 * to the official production Vercel deployment URL.
 */
export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return PRODUCTION_SITE_URL;
}

/**
 * Generates an absolute URL for a given relative path.
 */
export function absoluteUrl(path: string = '/'): string {
  const base = getSiteUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath === '/') return base;
  return `${base}${cleanPath}`;
}

export const SITE_CONFIG = {
  name: 'UNILAG Aggregate Calculator',
  shortName: 'UNILAG Calculator',
  tagline: 'Undergraduate Admission Screening Estimator & Cut-Off Comparison',
  description:
    'Free, accurate University of Lagos (UNILAG) undergraduate admission aggregate calculator. Computes UTME (50%), Post-UTME (30%), and O\'Level (20%) scores with official departmental cut-off comparison.',
  author: 'UNILAG Aggregate Calculator Technical Project',
  locale: 'en_NG',
  defaultThemeColor: '#0F2942',
  year: 2026,
  supportedSessions: ['2025/2026', '2026/2027'],
  officialSources: [
    {
      name: 'University of Lagos Main Portal',
      url: 'https://unilag.edu.ng/'
    },
    {
      name: 'UNILAG Admissions Office',
      url: 'https://admissions.unilag.edu.ng/'
    },
    {
      name: 'Official 2026/2027 Merit Cut-Off Release',
      url: 'https://unilag.edu.ng/unilag-releases-2026-2027-utme-merit-cut-off-marks/'
    }
  ]
} as const;
