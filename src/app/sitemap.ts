import type { MetadataRoute } from "next";
import { fetchAllPropertySitemapItems, fetchConfigServer } from "@/lib/cdn";
import { canonicalUrl, getCanonicalBaseUrl } from "@/lib/seo";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let baseUrl = getCanonicalBaseUrl();
  let generatedAt = new Date();

  try {
    const config = await fetchConfigServer();
    baseUrl = getCanonicalBaseUrl(config.contact.website);
    generatedAt = new Date(config.generated_at);
  } catch {
    // Use canonical fallback.
  }

  if (Number.isNaN(generatedAt.getTime())) generatedAt = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: canonicalUrl("/", baseUrl),
      lastModified: generatedAt,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: canonicalUrl("/imoveis", baseUrl),
      lastModified: generatedAt,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  let propertyRoutes: MetadataRoute.Sitemap = [];
  try {
    const items = await fetchAllPropertySitemapItems();
    propertyRoutes = items.map((item) => {
      const lastModified = item.lastModified ? new Date(item.lastModified) : generatedAt;
      return {
        url: canonicalUrl(`/imovel/${encodeURIComponent(item.slug)}`, baseUrl),
        lastModified: Number.isNaN(lastModified.getTime()) ? generatedAt : lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        ...(item.image && { images: [item.image] }),
      };
    });
  } catch {
    // CDN unavailable
  }

  return [...staticRoutes, ...propertyRoutes];
}
