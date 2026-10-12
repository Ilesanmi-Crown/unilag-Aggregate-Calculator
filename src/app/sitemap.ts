import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/config/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: absoluteUrl('/'),
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0
    },
    {
      url: absoluteUrl('/how-to-calculate-unilag-aggregate'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8
    },
    {
      url: absoluteUrl('/departmental-cut-off-marks-guide'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8
    },
    {
      url: absoluteUrl('/about'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5
    },
    {
      url: absoluteUrl('/contact'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5
    },
    {
      url: absoluteUrl('/privacy'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5
    }
  ];
}
