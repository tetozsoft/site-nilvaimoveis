"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { EnrichedProperty } from "@/data/properties";
import { normalizeAccents } from "@/lib/normalize";

const ITEMS_PER_PAGE = 12;

export interface PropertyFilters {
  cidade: string;
  bairro: string;
  transacao: string;
  localizacao: string;
  quartos: string;
  banheiros: string;
  vagas: string;
  area_min: string;
  area_max: string;
  preco_min: string;
  preco_max: string;
  ordenar: string;
  pagina: string;
  // Enriched fields
  suites: string;
  salas: string;
  area_construida_min: string;
  area_construida_max: string;
  area_terreno_min: string;
  area_terreno_max: string;
  ano_construcao_min: string;
  ano_construcao_max: string;
  tem_condominio: string;
  aceita_financiamento: string;
  aceita_permuta: string;
  mobiliado: string;
  valor_condominio_min: string;
  valor_condominio_max: string;
  valor_iptu_min: string;
  valor_iptu_max: string;
  feat_caracteristicas: string;
  feat_condominio: string;
  feat_seguranca: string;
}

export interface ActiveFilter {
  key: string;
  label: string;
  value: string;
}

const FILTER_LABELS: Record<string, string> = {
  cidade: "Cidade",
  bairro: "Bairro",
  transacao: "Transação",
  localizacao: "Localização",
  quartos: "Quartos",
  banheiros: "Banheiros",
  vagas: "Vagas",
  area_min: "Área mín.",
  area_max: "Área máx.",
  preco_min: "Preço mín.",
  preco_max: "Preço máx.",
  suites: "Suítes",
  salas: "Salas",
  area_construida_min: "Á. constr. mín.",
  area_construida_max: "Á. constr. máx.",
  area_terreno_min: "Terreno mín.",
  area_terreno_max: "Terreno máx.",
  ano_construcao_min: "Ano mín.",
  ano_construcao_max: "Ano máx.",
  tem_condominio: "Condomínio",
  aceita_financiamento: "Financiamento",
  aceita_permuta: "Permuta",
  mobiliado: "Mobiliado",
  valor_condominio_min: "Cond. mín.",
  valor_condominio_max: "Cond. máx.",
  valor_iptu_min: "IPTU mín.",
  valor_iptu_max: "IPTU máx.",
  feat_caracteristicas: "Características",
  feat_condominio: "Itens cond.",
  feat_seguranca: "Segurança",
};

function formatFilterValue(key: string, value: string): string {
  if (key === "cidade") return value;
  if (key === "bairro") return value;
  if (key === "transacao") return value === "venda" ? "Comprar" : "Alugar";
  if (key === "quartos") return `${value}+ quartos`;
  if (key === "banheiros") return `${value}+ banheiros`;
  if (key === "vagas") return `${value}+ vagas`;
  if (key === "suites") return `${value}+ suítes`;
  if (key === "salas") return `${value}+ salas`;
  if (key === "area_min" || key === "area_construida_min" || key === "area_terreno_min")
    return `${value}m² mín.`;
  if (key === "area_max" || key === "area_construida_max" || key === "area_terreno_max")
    return `${value}m² máx.`;
  if (key === "ano_construcao_min") return `Ano ${value}+`;
  if (key === "ano_construcao_max") return `Até ${value}`;
  if (key === "tem_condominio") return "Condomínio";
  if (key === "aceita_financiamento") return "Financiamento";
  if (key === "aceita_permuta") return "Permuta";
  if (key === "mobiliado") return "Mobiliado";
  if (
    key === "preco_min" ||
    key === "preco_max" ||
    key === "valor_condominio_min" ||
    key === "valor_condominio_max" ||
    key === "valor_iptu_min" ||
    key === "valor_iptu_max"
  ) {
    const n = Number(value);
    const suffix = key.endsWith("_min") ? " mín." : " máx.";
    if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1)}M${suffix}`;
    if (n >= 1_000) return `R$ ${(n / 1_000).toFixed(0)}K${suffix}`;
    return `R$ ${value}${suffix}`;
  }
  if (key === "feat_caracteristicas") {
    const count = value.split(",").length;
    return `${count} característica${count > 1 ? "s" : ""}`;
  }
  if (key === "feat_condominio") {
    const count = value.split(",").length;
    return `${count} ite${count > 1 ? "ns" : "m"} cond.`;
  }
  if (key === "feat_seguranca") {
    const count = value.split(",").length;
    return `${count} ite${count > 1 ? "ns" : "m"} seg.`;
  }
  return value;
}

function updateSearchParams(
  current: URLSearchParams,
  updates: Record<string, string | null>,
): URLSearchParams {
  const next = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(updates)) {
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
  }
  return next;
}

const ALL_FILTER_KEYS = [
  "cidade",
  "bairro",
  "transacao",
  "localizacao",
  "quartos",
  "banheiros",
  "vagas",
  "area_min",
  "area_max",
  "preco_min",
  "preco_max",
  "suites",
  "salas",
  "area_construida_min",
  "area_construida_max",
  "area_terreno_min",
  "area_terreno_max",
  "ano_construcao_min",
  "ano_construcao_max",
  "tem_condominio",
  "aceita_financiamento",
  "aceita_permuta",
  "mobiliado",
  "valor_condominio_min",
  "valor_condominio_max",
  "valor_iptu_min",
  "valor_iptu_max",
  "feat_caracteristicas",
  "feat_condominio",
  "feat_seguranca",
] as const;

export function usePropertyFilters(allProperties: EnrichedProperty[]) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Debounced location input
  const [locationInput, setLocationInput] = useState(searchParams.get("localizacao") || "");

  const filters: PropertyFilters = useMemo(() => {
    const f: Record<string, string> = {
      ordenar: searchParams.get("ordenar") || "",
      pagina: searchParams.get("pagina") || "1",
    };
    for (const key of ALL_FILTER_KEYS) {
      f[key] = searchParams.get(key) || "";
    }
    return f as unknown as PropertyFilters;
  }, [searchParams]);

  const replaceParams = useCallback(
    (next: URLSearchParams) => {
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  // Debounce location changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const current = searchParams.get("localizacao") || "";
      if (locationInput !== current) {
        const next = updateSearchParams(searchParams, {
          localizacao: locationInput || null,
          pagina: null,
        });
        replaceParams(next);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [locationInput]);

  // Keep local input synced with URL (e.g., when clearing all filters)
  useEffect(() => {
    const urlLoc = searchParams.get("localizacao") || "";
    if (urlLoc !== locationInput) {
      setLocationInput(urlLoc);
    }
  }, [searchParams.get("localizacao")]);

  const setFilter = useCallback(
    (key: string, value: string) => {
      if (key === "localizacao") {
        setLocationInput(value);
        return;
      }
      const updates: Record<string, string | null> = {
        [key]: value || null,
      };
      if (key !== "pagina") updates.pagina = null;
      const next = updateSearchParams(searchParams, updates);
      replaceParams(next);
    },
    [searchParams, replaceParams],
  );

  const removeFilter = useCallback(
    (key: string) => {
      if (key === "localizacao") {
        setLocationInput("");
      }
      const next = updateSearchParams(searchParams, {
        [key]: null,
        pagina: null,
      });
      replaceParams(next);
    },
    [searchParams, replaceParams],
  );

  const clearAllFilters = useCallback(() => {
    setLocationInput("");
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  // Active filter pills
  const activeFilters: ActiveFilter[] = useMemo(() => {
    const pills: ActiveFilter[] = [];
    for (const key of ALL_FILTER_KEYS) {
      const value = filters[key as keyof PropertyFilters];
      if (value) {
        pills.push({
          key,
          label: FILTER_LABELS[key] || key,
          value: formatFilterValue(key, value),
        });
      }
    }
    return pills;
  }, [filters]);

  // Filter + sort + paginate
  const { paginatedProperties, totalFiltered, totalPages, currentPage } = useMemo(() => {
    let result = [...allProperties];

    // Transaction type
    if (filters.transacao) {
      result = result.filter((p) => {
        if (p.transaction_type === "venda_aluguel") return true;
        return p.transaction_type === filters.transacao;
      });
    }

    // City (exact match, accent-insensitive)
    if (filters.cidade) {
      const normCidade = normalizeAccents(filters.cidade);
      result = result.filter((p) => normalizeAccents(p.endereco.cidade) === normCidade);
    }

    // Neighborhood (substring, case-insensitive)
    if (filters.bairro) {
      const b = filters.bairro.toLowerCase();
      result = result.filter((p) => (p.endereco.bairro || "").toLowerCase().includes(b));
    }

    // Location — legacy fallback (substring, case-insensitive)
    if (filters.localizacao) {
      const loc = filters.localizacao.toLowerCase();
      result = result.filter(
        (p) =>
          (p.endereco.cidade || "").toLowerCase().includes(loc) ||
          (p.endereco.bairro || "").toLowerCase().includes(loc),
      );
    }

    // Bedrooms (minimum)
    if (filters.quartos) {
      const min = Number(filters.quartos);
      result = result.filter((p) => p.quartos >= min);
    }

    // Bathrooms (minimum)
    if (filters.banheiros) {
      const min = Number(filters.banheiros);
      result = result.filter((p) => p.banheiros >= min);
    }

    // Parking (minimum)
    if (filters.vagas) {
      const min = Number(filters.vagas);
      result = result.filter((p) => p.vagas_garagem >= min);
    }

    // Area range
    if (filters.area_min) {
      const min = Number(filters.area_min);
      result = result.filter((p) => p.area_total != null && p.area_total >= min);
    }
    if (filters.area_max) {
      const max = Number(filters.area_max);
      result = result.filter((p) => p.area_total != null && p.area_total <= max);
    }

    // Price range
    if (filters.preco_min || filters.preco_max) {
      const priceField =
        filters.transacao === "aluguel" ? "valor_aluguel" : "valor_venda";
      if (filters.preco_min) {
        const min = Number(filters.preco_min);
        result = result.filter((p) => {
          const v = Number(p[priceField]);
          return v && v >= min;
        });
      }
      if (filters.preco_max) {
        const max = Number(filters.preco_max);
        result = result.filter((p) => {
          const v = Number(p[priceField]);
          return v && v <= max;
        });
      }
    }

    // ── Enriched filters (guard: skip non-enriched properties) ──

    // Suites (minimum)
    if (filters.suites) {
      const min = Number(filters.suites);
      result = result.filter((p) => !p._enriched || (p.suites ?? 0) >= min);
    }

    // Salas (minimum)
    if (filters.salas) {
      const min = Number(filters.salas);
      result = result.filter((p) => !p._enriched || (p.salas ?? 0) >= min);
    }

    // Área construída range
    if (filters.area_construida_min) {
      const min = Number(filters.area_construida_min);
      result = result.filter((p) => !p._enriched || (p.area_construida != null && p.area_construida >= min));
    }
    if (filters.area_construida_max) {
      const max = Number(filters.area_construida_max);
      result = result.filter((p) => !p._enriched || (p.area_construida != null && p.area_construida <= max));
    }

    // Área terreno range
    if (filters.area_terreno_min) {
      const min = Number(filters.area_terreno_min);
      result = result.filter((p) => !p._enriched || (p.area_terreno != null && p.area_terreno >= min));
    }
    if (filters.area_terreno_max) {
      const max = Number(filters.area_terreno_max);
      result = result.filter((p) => !p._enriched || (p.area_terreno != null && p.area_terreno <= max));
    }

    // Ano construção range
    if (filters.ano_construcao_min) {
      const min = Number(filters.ano_construcao_min);
      result = result.filter((p) => !p._enriched || (p.ano_construcao != null && p.ano_construcao >= min));
    }
    if (filters.ano_construcao_max) {
      const max = Number(filters.ano_construcao_max);
      result = result.filter((p) => !p._enriched || (p.ano_construcao != null && p.ano_construcao <= max));
    }

    // Boolean filters
    if (filters.tem_condominio === "true") {
      result = result.filter((p) => !p._enriched || p.tem_condominio === true);
    }
    if (filters.aceita_financiamento === "true") {
      result = result.filter((p) => !p._enriched || p.aceita_financiamento === true);
    }
    if (filters.aceita_permuta === "true") {
      result = result.filter((p) => !p._enriched || p.aceita_permuta === true);
    }
    if (filters.mobiliado === "true") {
      result = result.filter((p) => !p._enriched || p.mobiliado === true);
    }

    // Valor condomínio range
    if (filters.valor_condominio_min) {
      const min = Number(filters.valor_condominio_min);
      result = result.filter((p) => !p._enriched || (p.valor_condominio != null && p.valor_condominio >= min));
    }
    if (filters.valor_condominio_max) {
      const max = Number(filters.valor_condominio_max);
      result = result.filter((p) => !p._enriched || (p.valor_condominio != null && p.valor_condominio <= max));
    }

    // Valor IPTU range
    if (filters.valor_iptu_min) {
      const min = Number(filters.valor_iptu_min);
      result = result.filter((p) => !p._enriched || (p.valor_iptu != null && p.valor_iptu >= min));
    }
    if (filters.valor_iptu_max) {
      const max = Number(filters.valor_iptu_max);
      result = result.filter((p) => !p._enriched || (p.valor_iptu != null && p.valor_iptu <= max));
    }

    // Features (ALL match)
    if (filters.feat_caracteristicas) {
      const required = filters.feat_caracteristicas.split(",");
      result = result.filter(
        (p) => !p._enriched || !p.features || required.every((f) => p.features!.caracteristicas.includes(f)),
      );
    }
    if (filters.feat_condominio) {
      const required = filters.feat_condominio.split(",");
      result = result.filter(
        (p) => !p._enriched || !p.features || required.every((f) => p.features!.condominio.includes(f)),
      );
    }
    if (filters.feat_seguranca) {
      const required = filters.feat_seguranca.split(",");
      result = result.filter(
        (p) => !p._enriched || !p.features || required.every((f) => p.features!.seguranca.includes(f)),
      );
    }

    // Sort
    const sortKey = filters.ordenar || "recente";
    result.sort((a, b) => {
      switch (sortKey) {
        case "preco_asc": {
          const pa = Number(a.valor_venda ?? a.valor_aluguel) || 0;
          const pb = Number(b.valor_venda ?? b.valor_aluguel) || 0;
          return pa - pb;
        }
        case "preco_desc": {
          const pa = Number(a.valor_venda ?? a.valor_aluguel) || 0;
          const pb = Number(b.valor_venda ?? b.valor_aluguel) || 0;
          return pb - pa;
        }
        case "area_desc":
          return (b.area_total ?? 0) - (a.area_total ?? 0);
        case "recente":
        default:
          return (
            new Date(b.publicado_em).getTime() -
            new Date(a.publicado_em).getTime()
          );
      }
    });

    const totalFiltered = result.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / ITEMS_PER_PAGE));
    const currentPage = Math.min(Number(filters.pagina) || 1, totalPages);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedProperties = result.slice(start, start + ITEMS_PER_PAGE);

    return { paginatedProperties, totalFiltered, totalPages, currentPage };
  }, [allProperties, filters]);

  return {
    filters,
    setFilter,
    removeFilter,
    clearAllFilters,
    activeFilters,
    paginatedProperties,
    totalFiltered,
    totalPages,
    currentPage,
    locationInput,
    setLocationInput,
  };
}
