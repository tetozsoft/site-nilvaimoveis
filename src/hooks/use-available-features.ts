"use client";

import { useMemo } from "react";
import type { EnrichedProperty, PropertyFeatures } from "@/data/properties";

export interface AvailableFeatures {
  caracteristicas: string[];
  condominio: string[];
  seguranca: string[];
}

const EMPTY: AvailableFeatures = { caracteristicas: [], condominio: [], seguranca: [] };

export function useAvailableFeatures(properties: EnrichedProperty[]): AvailableFeatures {
  return useMemo(() => {
    const sets: Record<keyof PropertyFeatures, Set<string>> = {
      caracteristicas: new Set(),
      condominio: new Set(),
      seguranca: new Set(),
    };

    for (const p of properties) {
      if (!p._enriched || !p.features) continue;
      for (const f of p.features.caracteristicas) sets.caracteristicas.add(f);
      for (const f of p.features.condominio) sets.condominio.add(f);
      for (const f of p.features.seguranca) sets.seguranca.add(f);
    }

    const hasAny =
      sets.caracteristicas.size > 0 || sets.condominio.size > 0 || sets.seguranca.size > 0;
    if (!hasAny) return EMPTY;

    return {
      caracteristicas: [...sets.caracteristicas].sort(),
      condominio: [...sets.condominio].sort(),
      seguranca: [...sets.seguranca].sort(),
    };
  }, [properties]);
}
