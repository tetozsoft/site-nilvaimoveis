import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchConfigServer } from "@/lib/cdn";
import { canonicalUrl, getCanonicalBaseUrl } from "@/lib/seo";
import { FICHA_COPY, type FichaKind } from "@/lib/ficha";
import { FichaForm } from "./FichaForm";

export async function fichaMetadata(kind: FichaKind): Promise<Metadata> {
  const config = await fetchConfigServer().catch(() => null);
  const siteUrl = getCanonicalBaseUrl(config?.contact?.website);
  const copy = FICHA_COPY[kind];

  return {
    title: copy.pageTitle,
    description: copy.pageDescription,
    alternates: { canonical: canonicalUrl(copy.path, siteUrl) },
    // Página de uso do cliente: não deve aparecer em buscas.
    robots: { index: false, follow: false },
  };
}

export function FichaPage({ kind }: { kind: FichaKind }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <FichaForm kind={kind} />
    </Suspense>
  );
}
