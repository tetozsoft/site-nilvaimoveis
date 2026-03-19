import type { MetadataRoute } from "next";
import { fetchAllPropertySlugs, fetchConfigServer } from "@/lib/cdn";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let baseUrl = "https://example.com";

  try {
    const config = await fetchConfigServer();
    if (config.contact.website) {
      baseUrl = config.contact.website.replace(/\/$/, "");
    }
  } catch {
    // Use default
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/imoveis`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  let propertyRoutes: MetadataRoute.Sitemap = [];
  try {
    const slugs = await fetchAllPropertySlugs();
    propertyRoutes = slugs.map((slug) => ({
      url: `${baseUrl}/imovel/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // CDN unavailable
  }

  return [...staticRoutes, ...propertyRoutes];
}
