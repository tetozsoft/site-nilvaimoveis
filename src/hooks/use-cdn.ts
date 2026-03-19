"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchConfig,
  fetchDestaques,
  fetchListagem,
  fetchPropertyDetail,
  fetchMeta,
} from "@/lib/cdn";
import type { SiteConfig } from "@/data/config";

const STALE_TIME = 10 * 60 * 1000; // 10 minutes

export function useSiteConfig(initialData?: SiteConfig | null) {
  return useQuery({
    queryKey: ["siteConfig"],
    queryFn: fetchConfig,
    staleTime: STALE_TIME,
    initialData: initialData ?? undefined,
  });
}

export function useDestaques() {
  return useQuery({
    queryKey: ["destaques"],
    queryFn: fetchDestaques,
    staleTime: STALE_TIME,
    select: (data) => data.destaques,
  });
}

export function useListagem(page: number) {
  return useQuery({
    queryKey: ["listagem", page],
    queryFn: () => fetchListagem(page),
    staleTime: STALE_TIME,
  });
}

export function usePropertyDetail(slug: string | undefined) {
  return useQuery({
    queryKey: ["propertyDetail", slug],
    queryFn: () => fetchPropertyDetail(slug!),
    staleTime: STALE_TIME,
    enabled: !!slug,
  });
}

export function useMeta() {
  return useQuery({
    queryKey: ["meta"],
    queryFn: fetchMeta,
    staleTime: STALE_TIME,
  });
}
