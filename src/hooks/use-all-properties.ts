"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { useMeta } from "@/hooks/use-cdn";
import { fetchListagem, fetchPropertyDetail } from "@/lib/cdn";
import type { PropertyCard, EnrichedProperty } from "@/data/properties";

const STALE_TIME = 10 * 60 * 1000;

export function useAllProperties() {
  const { data: meta, isLoading: metaLoading, isError: metaError } = useMeta();

  const totalPages = meta?.total_pages ?? 0;

  const pageQueries = useQueries({
    queries: Array.from({ length: totalPages }, (_, i) => ({
      queryKey: ["listagem", i + 1],
      queryFn: () => fetchListagem(i + 1),
      staleTime: STALE_TIME,
      enabled: totalPages > 0,
    })),
  });

  const loadedCount = pageQueries.filter((q) => q.isSuccess).length;
  const progress = totalPages > 0 ? loadedCount / totalPages : 0;
  const isLoading = metaLoading || (totalPages > 0 && pageQueries.some((q) => q.isLoading));
  const isError = metaError || pageQueries.some((q) => q.isError);

  const allCards: PropertyCard[] = useMemo(() => {
    if (totalPages === 0) return [];
    const items: PropertyCard[] = [];
    for (const query of pageQueries) {
      if (query.data) {
        items.push(...query.data.items);
      }
    }
    return items;
  }, [pageQueries, totalPages]);

  const listingsReady = !isLoading && !isError && allCards.length > 0;

  // Enrich each card with detail data
  const detailQueries = useQueries({
    queries: allCards.map((card) => ({
      queryKey: ["propertyDetail", card.slug],
      queryFn: () => fetchPropertyDetail(card.slug),
      staleTime: STALE_TIME,
      enabled: listingsReady,
    })),
  });

  const isEnriching = listingsReady && detailQueries.some((q) => q.isLoading);

  const enrichedProperties: EnrichedProperty[] = useMemo(() => {
    return allCards.map((card, i) => {
      const detail = detailQueries[i]?.data;
      if (!detail) {
        return { ...card, _enriched: false };
      }
      return {
        ...card,
        suites: detail.suites,
        salas: detail.salas,
        andares: detail.andares,
        andar: detail.andar ?? null,
        area_construida: detail.area_construida,
        area_terreno: detail.area_terreno,
        tem_condominio: detail.tem_condominio,
        nome_condominio: detail.nome_condominio,
        ano_construcao: detail.ano_construcao,
        aceita_financiamento: detail.aceita_financiamento,
        aceita_permuta: detail.aceita_permuta,
        mobiliado: detail.mobiliado,
        features: detail.features,
        valor_condominio: detail.valor_condominio,
        valor_iptu: detail.valor_iptu,
        _enriched: true,
      };
    });
  }, [allCards, detailQueries]);

  return {
    properties: enrichedProperties,
    meta,
    isLoading,
    isError,
    isEnriching,
    progress,
  };
}
