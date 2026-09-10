import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { getCatalogProducts } from '@/lib/catalog'

const STATIC_PATHS = [
  '',
  '/collections/all',
  '/collections/been-brooklyn',
  '/collections/been-brooklyn-baller',
  '/collections/so-new-york',
  '/collections/hoodies',
  '/collections/tees',
  '/about',
  '/contact',
  '/size-guide',
  '/testimonials',
  '/social',
  '/policies',
  '/policies/shipping',
  '/policies/delivery',
  '/policies/returns',
  '/policies/customer-service',
  '/terms',
  '/privacy',
]

// Picks up products published from the admin without a redeploy.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getCatalogProducts()

  return [
    ...STATIC_PATHS.map((path) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.6,
    })),
    ...products.map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
