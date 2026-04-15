import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchConfigServer } from "@/lib/cdn";
import { ImoveisClient } from "./ImoveisClient";

export async function generateMetadata(): Promise<Metadata> {
  const config = await fetchConfigServer().catch(() => null);

  const title = config?.listing?.title || "Imóveis";
  const description = config
    ? `Explore nossa seleção completa de imóveis. ${config.company_name} - ${config.seo?.description || ""}`
    : "Explore nossa seleção completa de imóveis e encontre o lugar perfeito para você.";

  return {
    title,
    description,
    openGraph: {
      title: config ? `${title} | ${config.site_name}` : title,
      description,
      url: "/imoveis",
    },
  };
}

export default function ImoveisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ImoveisClient />
    </Suspense>
  );
}
