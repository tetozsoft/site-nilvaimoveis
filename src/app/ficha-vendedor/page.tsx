import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchConfigServer } from "@/lib/cdn";
import { canonicalUrl, getCanonicalBaseUrl } from "@/lib/seo";
import { FichaVendedorClient } from "./FichaVendedorClient";

export async function generateMetadata(): Promise<Metadata> {
  const config = await fetchConfigServer().catch(() => null);
  const siteUrl = getCanonicalBaseUrl(config?.contact?.website);

  return {
    title: "Ficha do vendedor",
    description:
      "Preencha a ficha do vendedor para a elaboração do contrato de compra e venda do seu imóvel e envie pelo WhatsApp.",
    alternates: { canonical: canonicalUrl("/ficha-vendedor", siteUrl) },
    // Página de uso interno do cliente: não deve aparecer em buscas.
    robots: { index: false, follow: false },
  };
}

export default function FichaVendedorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <FichaVendedorClient />
    </Suspense>
  );
}
