import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://whatsfordinner.com';
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/roadmap`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
  ];

  // Cross-channel landing pages
  const landingPages = [
    '/for-families',
    '/for-churches',
    '/for-wellness',
    '/for-corporate',
    '/for-fitness',
    '/for-seniors',
    '/for-schools',
    '/for-healthcare',
  ].map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Blog posts (from content/blog directory)
  const blogPosts = [
    'what-to-make-with-chicken-and-rice',
    'pantry-staples-20-meals',
    'how-to-reduce-food-waste',
    'quick-dinner-5-ingredients',
    'what-to-make-nothing-in-fridge',
    'keto-recipes-pantry-staples',
    'vegan-recipes-pantry-staples',
    'budget-friendly-recipes-pantry',
    '30-minute-recipes-5-ingredients',
    'kid-friendly-recipes-pantry',
    'meal-prep-recipes-pantry',
    'pantry-only-recipes-busy-weeknights',
    'what-to-make-with-leftover-ingredients',
    'healthy-recipes-pantry-staples',
    'one-pan-pantry-meals',
    'competitive-differentiation',
    'why-were-different',
  ].map(slug => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...landingPages, ...blogPosts];
}
