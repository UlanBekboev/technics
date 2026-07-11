import type { MetadataRoute } from "next";
import { getProducts, getCategoriesFlat } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productsRes, categories] = await Promise.all([
    getProducts({ limit: 5000 }).catch(() => ({ items: [] })),
    getCategoriesFlat().catch(() => []),
  ]);

  const products: { slug: string; updatedAt?: string }[] = productsRes?.items ?? [];
  const categoryEntries: { slug: string; showInCatalog?: boolean }[] = categories;

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/catalog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/aktsii`, changeFrequency: "weekly", priority: 0.6 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categoryEntries
    .filter((c) => c.showInCatalog !== false)
    .map((c) => ({
      url: `${SITE_URL}/catalog?category=${c.slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
