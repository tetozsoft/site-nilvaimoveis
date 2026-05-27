"use client";

import { createContext, useContext } from "react";
import type { SiteConfig } from "@/data/config";
import { useSiteConfig } from "@/hooks/use-cdn";
import { useDynamicFavicon } from "@/hooks/use-dynamic-favicon";

const SiteConfigContext = createContext<SiteConfig | null>(null);

export function SiteConfigProvider({
  children,
  initialConfig,
}: {
  children: React.ReactNode;
  initialConfig: SiteConfig | null;
}) {
  const { data, isLoading, isError, refetch } = useSiteConfig(initialConfig);

  // Keep the page skin fixed to the Splendido-inspired theme while still using
  // CDN data for logo, content, SEO, contact, favicon, properties, and images.
  useDynamicFavicon(data?.logo_url ?? null, data?.company_name ?? "", data?.primary_color ?? "#1a3366");

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-destructive text-lg font-medium">Erro ao carregar o site</p>
        <p className="text-muted-foreground text-sm">Não foi possível conectar ao servidor.</p>
        <button
          onClick={() => refetch()}
          className="px-6 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <SiteConfigContext.Provider value={data}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfigContext(): SiteConfig {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) {
    throw new Error("useSiteConfigContext must be used within SiteConfigProvider");
  }
  return ctx;
}
