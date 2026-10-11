import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://unilag-aggregate-calculator.ng';
  const lastModified = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0
    },
    {
      url: `${baseUrl}/how-to-calculate-unilag-aggregate/`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8
    },
    {
      url: `${baseUrl}/departmental-cut-off-marks-guide/`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8
    }
  ];
}
