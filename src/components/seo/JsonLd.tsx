import React from 'react';
import { absoluteUrl, SITE_CONFIG } from '@/config/site';

interface JsonLdProps {
  schema: Record<string, unknown> | Array<Record<string, unknown>>;
}

export const JsonLd: React.FC<JsonLdProps> = ({ schema }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

/**
 * Builds WebSite schema for the homepage.
 */
export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.shortName,
    url: absoluteUrl('/'),
    description: SITE_CONFIG.description,
    inLanguage: 'en-NG'
  };
}

/**
 * Builds WebApplication schema for the calculator utility.
 */
export function buildWebApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_CONFIG.name,
    url: absoluteUrl('/'),
    description: SITE_CONFIG.description,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'All (Web Browser)',
    browserRequirements: 'Requires JavaScript and HTML5 support',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'NGN'
    },
    featureList: [
      'JAMB/UTME 50% score conversion (UTME score divided by 8)',
      'UNILAG Post-UTME 30% screening test evaluation',
      'O\'Level 20% single-sitting grade-to-point calculation (A1=4.0 down to C6=2.0)',
      'Reverse target calculator to determine required Post-UTME score',
      'Official departmental cut-off mark lookup across 112 degree programmes',
      'Merit and South-Western Catchment quota comparison',
      'Free in-browser result slip OCR interpreter with 100% local processing'
    ]
  };
}

/**
 * Builds BreadcrumbList schema for structured navigation.
 */
export function buildBreadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

/**
 * Builds Article schema for educational guides.
 */
export function buildArticleSchema({
  title,
  description,
  path,
  datePublished,
  dateModified
}: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: absoluteUrl(path),
    inLanguage: 'en-NG',
    datePublished,
    dateModified,
    author: {
      '@type': 'Organization',
      name: SITE_CONFIG.author,
      url: absoluteUrl('/')
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.author,
      url: absoluteUrl('/')
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(path)
    }
  };
}
