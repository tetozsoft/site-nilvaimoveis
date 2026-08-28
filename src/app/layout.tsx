import type { Metadata } from "next";
import { Providers } from "./providers";
import { fetchConfigServer } from "@/lib/cdn";
import { canonicalUrl, getCanonicalBaseUrl } from "@/lib/seo";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const config = await fetchConfigServer().catch(() => null);
  const siteUrl = getCanonicalBaseUrl(config?.contact?.website);
  const ogImage = config?.banner?.bg_url || null;

  return {
    metadataBase: new URL(siteUrl),
    applicationName: config?.company_name || "Nilva Imoveis",
    title: {
      default: config?.site_name || "Imobiliária",
      template: `%s | ${config?.site_name || "Imobiliária"}`,
    },
    description: config?.seo?.description || "Encontre o imóvel dos seus sonhos",
    keywords: config?.seo?.keywords,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      locale: "pt_BR",
      siteName: config?.site_name,
      type: "website",
      url: canonicalUrl("/", siteUrl),
      ...(ogImage && {
        images: [{ url: ogImage, width: 1200, height: 630, alt: config?.company_name || "" }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await fetchConfigServer().catch(() => null);

  return (
    <html lang="pt-BR">
      <body>
        <Providers initialConfig={config}>{children}</Providers>
      </body>
    </html>
  );
}
