"use client";

import { useReducer, useState, useCallback, useMemo, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMeta } from "@/hooks/use-cdn";
import { useAllProperties } from "@/hooks/use-all-properties";
import { useAvailableFeatures } from "@/hooks/use-available-features";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CityCombobox } from "@/components/CityCombobox";
import { BairroCombobox } from "@/components/BairroCombobox";
import { NumberStepper } from "@/components/NumberStepper";
import { ActiveFilterChips } from "@/components/ActiveFilterChips";
import { SearchBarFilterModal, type SearchBarFilters } from "@/components/SearchBarFilterModal";

const EMPTY_FILTERS: SearchBarFilters = {
  cidade: "",
  bairro: "",
  transacao: "",
  quartos: "",
  banheiros: "",
  vagas: "",
  area_min: "",
  area_max: "",
  preco_min: "",
  preco_max: "",
  suites: "",
  salas: "",
  area_construida_min: "",
  area_construida_max: "",
  area_terreno_min: "",
  area_terreno_max: "",
  ano_construcao_min: "",
  ano_construcao_max: "",
  tem_condominio: "",
  aceita_financiamento: "",
  aceita_permuta: "",
  mobiliado: "",
  valor_condominio_min: "",
  valor_condominio_max: "",
  valor_iptu_min: "",
  valor_iptu_max: "",
  feat_caracteristicas: "",
  feat_condominio: "",
  feat_seguranca: "",
};

type Action =
  | { type: "SELECT_CITY"; city: string }
  | { type: "CLEAR_CITY" }
  | { type: "SET_FILTER"; key: keyof SearchBarFilters; value: string }
  | { type: "REMOVE_FILTER"; key: keyof SearchBarFilters }
  | { type: "CLEAR_ALL" }
  | { type: "INIT"; filters: SearchBarFilters };

function reducer(state: SearchBarFilters, action: Action): SearchBarFilters {
  switch (action.type) {
    case "SELECT_CITY":
      return { ...state, cidade: action.city, bairro: "" };
    case "CLEAR_CITY":
      return { ...EMPTY_FILTERS };
    case "SET_FILTER":
      return { ...state, [action.key]: action.value };
    case "REMOVE_FILTER":
      return { ...state, [action.key]: "" };
    case "CLEAR_ALL":
      return { ...EMPTY_FILTERS };
    case "INIT":
      return action.filters;
    default:
      return state;
  }
}

function formatPrice(v: string, suffix: string): string {
  const n = Number(v);
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1)}M ${suffix}`;
  if (n >= 1_000) return `R$ ${(n / 1_000).toFixed(0)}K ${suffix}`;
  return `R$ ${v} ${suffix}`;
}

const FILTER_DISPLAY: Record<string, (v: string) => string> = {
  transacao: (v) => (v === "aluguel" ? "Alugar" : "Comprar"),
  quartos: (v) => `${v}+ quartos`,
  banheiros: (v) => `${v}+ banheiros`,
  vagas: (v) => `${v}+ vagas`,
  suites: (v) => `${v}+ suítes`,
  salas: (v) => `${v}+ salas`,
  area_min: (v) => `${v}m² mín.`,
  area_max: (v) => `${v}m² máx.`,
  area_construida_min: (v) => `${v}m² constr. mín.`,
  area_construida_max: (v) => `${v}m² constr. máx.`,
  area_terreno_min: (v) => `${v}m² terreno mín.`,
  area_terreno_max: (v) => `${v}m² terreno máx.`,
  ano_construcao_min: (v) => `Ano ${v}+`,
  ano_construcao_max: (v) => `Até ${v}`,
  preco_min: (v) => formatPrice(v, "mín."),
  preco_max: (v) => formatPrice(v, "máx."),
  valor_condominio_min: (v) => formatPrice(v, "cond. mín."),
  valor_condominio_max: (v) => formatPrice(v, "cond. máx."),
  valor_iptu_min: (v) => formatPrice(v, "IPTU mín."),
  valor_iptu_max: (v) => formatPrice(v, "IPTU máx."),
  tem_condominio: () => "Condomínio",
  aceita_financiamento: () => "Financiamento",
  aceita_permuta: () => "Permuta",
  mobiliado: () => "Mobiliado",
  feat_caracteristicas: (v) => {
    const c = v.split(",").length;
    return `${c} característica${c > 1 ? "s" : ""}`;
  },
  feat_condominio: (v) => {
    const c = v.split(",").length;
    return `${c} ite${c > 1 ? "ns" : "m"} cond.`;
  },
  feat_seguranca: (v) => {
    const c = v.split(",").length;
    return `${c} ite${c > 1 ? "ns" : "m"} seg.`;
  },
  bairro: (v) => v,
};

const CHIP_KEYS: (keyof SearchBarFilters)[] = [
  "transacao",
  "bairro",
  "quartos",
  "banheiros",
  "vagas",
  "suites",
  "salas",
  "area_min",
  "area_max",
  "area_construida_min",
  "area_construida_max",
  "area_terreno_min",
  "area_terreno_max",
  "ano_construcao_min",
  "ano_construcao_max",
  "preco_min",
  "preco_max",
  "valor_condominio_min",
  "valor_condominio_max",
  "valor_iptu_min",
  "valor_iptu_max",
  "tem_condominio",
  "aceita_financiamento",
  "aceita_permuta",
  "mobiliado",
  "feat_caracteristicas",
  "feat_condominio",
  "feat_seguranca",
];

const ALL_KEYS = Object.keys(EMPTY_FILTERS) as (keyof SearchBarFilters)[];

function filtersFromParams(params: URLSearchParams): SearchBarFilters {
  const f = { ...EMPTY_FILTERS };
  for (const key of ALL_KEYS) {
    f[key] = params.get(key) || "";
  }
  return f;
}

function buildParams(filters: SearchBarFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  return params.toString();
}

export function SearchBar() {
  const { data: meta } = useMeta();
  const { properties, isEnriching } = useAllProperties();
  const availableFeatures = useAvailableFeatures(properties);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isOnImoveis = pathname === "/imoveis";

  // Initialize state from URL params (useful when on /imoveis)
  const [filters, dispatch] = useReducer(reducer, EMPTY_FILTERS, () =>
    filtersFromParams(searchParams),
  );
  const [modalOpen, setModalOpen] = useState(false);

  // Sync when URL params change externally (e.g. browser back/forward)
  const paramsKey = searchParams.toString();
  useEffect(() => {
    dispatch({ type: "INIT", filters: filtersFromParams(searchParams) });
  }, [paramsKey]);

  const citySelected = !!filters.cidade;

  const navigate = useCallback(
    (f: SearchBarFilters) => {
      const qs = buildParams(f);
      const url = qs ? `/imoveis?${qs}` : "/imoveis";
      if (isOnImoveis) {
        router.replace(url, { scroll: false });
      } else {
        router.push(url);
      }
    },
    [router, isOnImoveis],
  );

  const handleSearch = useCallback(() => {
    navigate(filters);
  }, [filters, navigate]);

  // On /imoveis, removing a chip applies immediately
  const handleRemoveChip = useCallback(
    (key: string) => {
      const updated = { ...filters, [key]: "" };
      dispatch({ type: "REMOVE_FILTER", key: key as keyof SearchBarFilters });
      if (isOnImoveis) navigate(updated);
    },
    [filters, isOnImoveis, navigate],
  );

  const handleClearAll = useCallback(() => {
    dispatch({ type: "CLEAR_ALL" });
    if (isOnImoveis) navigate(EMPTY_FILTERS);
  }, [isOnImoveis, navigate]);

  const handleClearCity = useCallback(() => {
    dispatch({ type: "CLEAR_CITY" });
    if (isOnImoveis) navigate(EMPTY_FILTERS);
  }, [isOnImoveis, navigate]);

  const chips = useMemo(() => {
    const result: { key: string; label: string }[] = [];
    for (const key of CHIP_KEYS) {
      const value = filters[key];
      if (value) {
        const formatter = FILTER_DISPLAY[key];
        result.push({ key, label: formatter ? formatter(value) : value });
      }
    }
    return result;
  }, [filters]);

  const handleModalApply = useCallback(() => {
    setModalOpen(false);
    if (isOnImoveis) navigate(filters);
  }, [filters, isOnImoveis, navigate]);

  const handleModalClear = useCallback(() => {
    const cidade = filters.cidade;
    dispatch({ type: "CLEAR_ALL" });
    if (cidade) dispatch({ type: "SELECT_CITY", city: cidade });
    if (isOnImoveis) navigate({ ...EMPTY_FILTERS, cidade });
  }, [filters.cidade, isOnImoveis, navigate]);

  // On /imoveis, selecting city applies immediately
  const handleSelectCity = useCallback(
    (city: string) => {
      dispatch({ type: "SELECT_CITY", city });
      if (isOnImoveis) navigate({ ...EMPTY_FILTERS, cidade: city });
    },
    [isOnImoveis, navigate],
  );

  if (!meta) return null;

  return (
    <div className={`bg-background/95 backdrop-blur-md rounded-2xl px-5 py-4 md:px-8 md:py-5 shadow-2xl mx-auto transition-all duration-300 ${citySelected ? "max-w-4xl" : "max-w-xl"}`}>
      {/* Step 1: City selection */}
      {!citySelected && (
        <CityCombobox
          cities={meta.cities}
          value={filters.cidade}
          onSelect={handleSelectCity}
        />
      )}

      {/* Step 2: City selected — show refinements */}
      {citySelected && (
        <>
          {/* City badge */}
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="gap-1 pr-1 text-sm">
              {filters.cidade}
              <button
                type="button"
                className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                onClick={handleClearCity}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </div>

          {/* Refinement row */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end transition-all duration-300">
            {/* Bairro combobox */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Bairro
              </label>
              <BairroCombobox
                city={filters.cidade}
                value={filters.bairro}
                onSelect={(bairro) =>
                  dispatch({ type: "SET_FILTER", key: "bairro", value: bairro })
                }
              />
            </div>

            {/* Quartos stepper */}
            <NumberStepper
              label="Quartos"
              value={filters.quartos ? Number(filters.quartos) : 0}
              min={0}
              max={meta.available_filters.quartos.length ? Math.max(...meta.available_filters.quartos) : 10}
              onChange={(n) =>
                dispatch({ type: "SET_FILTER", key: "quartos", value: String(n) })
              }
            />

            {/* More filters button */}
            <div className="flex items-end">
              <Button
                variant="outline"
                className="h-10 gap-2"
                onClick={() => setModalOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Mais filtros</span>
              </Button>
            </div>

            {/* Search button */}
            <div className="flex items-end">
              <Button
                className="btn-accent h-10 gap-2 px-6"
                onClick={handleSearch}
              >
                <Search className="h-4 w-4" />
                Buscar
              </Button>
            </div>
          </div>

          {/* Active filter chips */}
          <ActiveFilterChips
            chips={chips}
            onRemove={handleRemoveChip}
            onClearAll={handleClearAll}
          />
        </>
      )}

      {/* Filter modal */}
      <SearchBarFilterModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        meta={meta}
        filters={filters}
        onFilterChange={(key, value) => dispatch({ type: "SET_FILTER", key, value })}
        onClear={handleModalClear}
        onApply={handleModalApply}
        availableFeatures={availableFeatures}
        isEnriching={isEnriching}
      />
    </div>
  );
}
