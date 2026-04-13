"use client";

import { createContext, useContext, useEffect } from "react";
import type { SiteConfig } from "@/data/config";
import { useSiteConfig } from "@/hooks/use-cdn";
import { useDynamicFavicon } from "@/hooks/use-dynamic-favicon";

const SiteConfigContext = createContext<SiteConfig | null>(null);

/**
 * Convert a hex color (#RRGGBB or #RGB) to HSL channels {h, s, l}.
 * Returns null if the input is falsy or not a valid hex string.
 */
function hexToHslChannels(hex: string | undefined | null): { h: number; s: string; l: string } | null {
  if (!hex) return null;
  const cleaned = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{3,8}$/.test(cleaned)) return null;

  let r: number, g: number, b: number;
  if (cleaned.length === 3) {
    r = parseInt(cleaned[0] + cleaned[0], 16) / 255;
    g = parseInt(cleaned[1] + cleaned[1], 16) / 255;
    b = parseInt(cleaned[2] + cleaned[2], 16) / 255;
  } else {
    r = parseInt(cleaned.slice(0, 2), 16) / 255;
    g = parseInt(cleaned.slice(2, 4), 16) / 255;
    b = parseInt(cleaned.slice(4, 6), 16) / 255;
  }

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: "0%", l: `${Math.round(l * 100)}%` };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    default:
      h = ((r - g) / d + 4) / 6;
      break;
  }

  return {
    h: Math.round(h * 360),
    s: `${Math.round(s * 100)}%`,
    l: `${Math.round(l * 100)}%`,
  };
}

/** Apply CDN color overrides as HSL channel CSS custom properties. */
function useColorOverrides(config: SiteConfig | undefined) {
  useEffect(() => {
    if (!config) return;
    const root = document.documentElement.style;

    // CDN naming → site token mapping:
    //   CDN primary_color    → --color-primary (brand main color: header, buttons)
    //   CDN secondary_color  → --color-accent  (brand accent: gold CTAs, highlights)
    //   CDN font_color       → --color-text    (body text, muted text, borders)
    //   CDN heading_color    → --color-heading  (section titles, card titles)
    //   CDN footer_bg_color  → --color-footer-bg (footer background)
    //   CDN accent_color     → (skipped — CDN sends white, not useful)
    //   CDN background_color → (skipped — keep white default for section contrast)
    const mapping: [string, string | undefined][] = [
      ["primary", config.primary_color],
      ["accent", config.secondary_color],
      ["text", config.font_color],
      ["heading", config.heading_color],
      ["footer-bg", config.footer_bg_color],
    ];

    for (const [token, hex] of mapping) {
      const hsl = hexToHslChannels(hex);
      if (hsl) {
        root.setProperty(`--color-${token}-h`, String(hsl.h));
        root.setProperty(`--color-${token}-s`, hsl.s);
        root.setProperty(`--color-${token}-l`, hsl.l);
      }
    }
  }, [config]);
}

export function SiteConfigProvider({
  children,
  initialConfig,
}: {
  children: React.ReactNode;
  initialConfig: SiteConfig | null;
}) {
  const { data, isLoading, isError, refetch } = useSiteConfig(initialConfig);

  useColorOverrides(data);
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
