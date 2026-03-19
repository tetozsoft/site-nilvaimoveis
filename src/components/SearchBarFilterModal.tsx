"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import type { MetaResponse } from "@/lib/cdn";
import type { AvailableFeatures } from "@/hooks/use-available-features";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface SearchBarFilters {
  cidade: string;
  bairro: string;
  transacao: string;
  quartos: string;
  banheiros: string;
  vagas: string;
  area_min: string;
  area_max: string;
  preco_min: string;
  preco_max: string;
  // New enriched fields
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

interface SearchBarFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meta: MetaResponse;
  filters: SearchBarFilters;
  onFilterChange: (key: keyof SearchBarFilters, value: string) => void;
  onClear: () => void;
  onApply: () => void;
  availableFeatures: AvailableFeatures;
  isEnriching?: boolean;
}

const DEFAULT_PILLS = [0, 1, 2, 3, 4, 5];

/* ── Pill selector (quartos, banheiros, vagas, suites, salas) ── */
function PillSelector({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: number[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-medium text-foreground mr-1">{label}</span>
      {options.map((n) => {
        const selected = value === String(n);
        return (
          <button
            key={n}
            type="button"
            className={cn(
              "h-8 min-w-[2.25rem] px-3 text-sm rounded-full inline-flex items-center justify-center transition-colors",
              selected
                ? "bg-primary text-primary-foreground border border-primary shadow-sm"
                : "bg-muted/50 text-muted-foreground border border-transparent hover:border-input hover:bg-muted",
            )}
            onClick={() => onChange(selected ? "" : String(n))}
          >
            {n}+
          </button>
        );
      })}
    </div>
  );
}

/* ── Range input pair ── */
function RangeInput({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  placeholderMin,
  placeholderMax,
}: {
  label: string;
  minValue: string;
  maxValue: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
  placeholderMin: string;
  placeholderMax: string;
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          placeholder={placeholderMin}
          value={minValue}
          onChange={(e) => onMinChange(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-ring"
        />
        <input
          type="number"
          placeholder={placeholderMax}
          value={maxValue}
          onChange={(e) => onMaxChange(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-ring"
        />
      </div>
    </div>
  );
}

/* ── Switch row ── */
function SwitchRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

/* ── Checkbox group for features ── */
function CheckboxGroup({
  title,
  options,
  selected,
  onChange,
}: {
  title: string;
  options: string[];
  selected: Set<string>;
  onChange: (next: string) => void;
}) {
  if (options.length === 0) return null;

  const toggle = (item: string) => {
    const next = new Set(selected);
    if (next.has(item)) {
      next.delete(item);
    } else {
      next.add(item);
    }
    onChange([...next].join(","));
  };

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-foreground">{title}</span>
      <div className="grid grid-cols-2 gap-2">
        {options.map((item) => (
          <label
            key={item}
            className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
          >
            <Checkbox
              checked={selected.has(item)}
              onCheckedChange={() => toggle(item)}
            />
            {item}
          </label>
        ))}
      </div>
    </div>
  );
}

/* ── Filter body with 4 tabs ── */
function FilterBody({
  meta,
  filters,
  onFilterChange,
  availableFeatures,
  isEnriching,
}: Pick<SearchBarFilterModalProps, "meta" | "filters" | "onFilterChange" | "availableFeatures" | "isEnriching">) {
  const priceRange =
    filters.transacao === "aluguel" ? meta.price_range_aluguel : meta.price_range_venda;

  const featCaracSet = new Set(filters.feat_caracteristicas ? filters.feat_caracteristicas.split(",") : []);
  const featCondSet = new Set(filters.feat_condominio ? filters.feat_condominio.split(",") : []);
  const featSegSet = new Set(filters.feat_seguranca ? filters.feat_seguranca.split(",") : []);

  return (
    <Tabs defaultValue="basico" className="w-full">
      <TabsList className="w-full grid grid-cols-4 mb-4">
        <TabsTrigger value="basico" className="text-xs sm:text-sm">Básico</TabsTrigger>
        <TabsTrigger value="detalhes" className="text-xs sm:text-sm">Detalhes</TabsTrigger>
        <TabsTrigger value="valores" className="text-xs sm:text-sm">Valores</TabsTrigger>
        <TabsTrigger value="caracteristicas" className="text-xs sm:text-sm">Caract.</TabsTrigger>
      </TabsList>

      {/* ── Tab: Básico ── */}
      <TabsContent value="basico" className="space-y-4">
        {/* Toggle Comprar / Alugar */}
        <div className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">Tipo de Busca</span>
          <div className="flex rounded-lg border border-input overflow-hidden">
            <button
              type="button"
              className={cn(
                "flex-1 py-2.5 text-sm font-medium transition-colors",
                filters.transacao !== "aluguel"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted",
              )}
              onClick={() => onFilterChange("transacao", "venda")}
            >
              Comprar
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 py-2.5 text-sm font-medium transition-colors",
                filters.transacao === "aluguel"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted",
              )}
              onClick={() => onFilterChange("transacao", "aluguel")}
            >
              Alugar
            </button>
          </div>
        </div>

        {/* Pills */}
        <div className="space-y-3">
          <PillSelector
            label="Banheiros"
            options={meta.available_filters.banheiros?.length ? meta.available_filters.banheiros : DEFAULT_PILLS}
            value={filters.banheiros}
            onChange={(v) => onFilterChange("banheiros", v)}
          />
          <PillSelector
            label="Vagas"
            options={meta.available_filters.vagas?.length ? meta.available_filters.vagas : DEFAULT_PILLS}
            value={filters.vagas}
            onChange={(v) => onFilterChange("vagas", v)}
          />
          <PillSelector
            label="Suítes"
            options={DEFAULT_PILLS}
            value={filters.suites}
            onChange={(v) => onFilterChange("suites", v)}
          />
          <PillSelector
            label="Salas"
            options={DEFAULT_PILLS}
            value={filters.salas}
            onChange={(v) => onFilterChange("salas", v)}
          />
        </div>
      </TabsContent>

      {/* ── Tab: Detalhes ── */}
      <TabsContent value="detalhes" className="space-y-4">
        {/* Área total */}
        <RangeInput
          label="Área Total"
          minValue={filters.area_min}
          maxValue={filters.area_max}
          onMinChange={(v) => onFilterChange("area_min", v)}
          onMaxChange={(v) => onFilterChange("area_max", v)}
          placeholderMin="Mín. m²"
          placeholderMax="Máx. m²"
        />
        {/* Área construída */}
        <RangeInput
          label="Área Construída"
          minValue={filters.area_construida_min}
          maxValue={filters.area_construida_max}
          onMinChange={(v) => onFilterChange("area_construida_min", v)}
          onMaxChange={(v) => onFilterChange("area_construida_max", v)}
          placeholderMin="Mín. m²"
          placeholderMax="Máx. m²"
        />
        {/* Área terreno */}
        <RangeInput
          label="Área Terreno"
          minValue={filters.area_terreno_min}
          maxValue={filters.area_terreno_max}
          onMinChange={(v) => onFilterChange("area_terreno_min", v)}
          onMaxChange={(v) => onFilterChange("area_terreno_max", v)}
          placeholderMin="Mín. m²"
          placeholderMax="Máx. m²"
        />
        {/* Ano construção */}
        <RangeInput
          label="Ano de Construção"
          minValue={filters.ano_construcao_min}
          maxValue={filters.ano_construcao_max}
          onMinChange={(v) => onFilterChange("ano_construcao_min", v)}
          onMaxChange={(v) => onFilterChange("ano_construcao_max", v)}
          placeholderMin="De"
          placeholderMax="Até"
        />

        {/* Switches */}
        <div className="border-t border-border/50 pt-4 space-y-1">
          <SwitchRow
            label="Tem Condomínio"
            checked={filters.tem_condominio === "true"}
            onChange={(v) => onFilterChange("tem_condominio", v ? "true" : "")}
          />
          <SwitchRow
            label="Aceita Financiamento"
            checked={filters.aceita_financiamento === "true"}
            onChange={(v) => onFilterChange("aceita_financiamento", v ? "true" : "")}
          />
          <SwitchRow
            label="Aceita Permuta"
            checked={filters.aceita_permuta === "true"}
            onChange={(v) => onFilterChange("aceita_permuta", v ? "true" : "")}
          />
          <SwitchRow
            label="Mobiliado"
            checked={filters.mobiliado === "true"}
            onChange={(v) => onFilterChange("mobiliado", v ? "true" : "")}
          />
        </div>
      </TabsContent>

      {/* ── Tab: Valores ── */}
      <TabsContent value="valores" className="space-y-4">
        {/* Preço */}
        <RangeInput
          label="Preço"
          minValue={filters.preco_min}
          maxValue={filters.preco_max}
          onMinChange={(v) => onFilterChange("preco_min", v)}
          onMaxChange={(v) => onFilterChange("preco_max", v)}
          placeholderMin="Mín. R$"
          placeholderMax="Máx. R$"
        />
        {/* Valor condomínio */}
        <RangeInput
          label="Valor Condomínio"
          minValue={filters.valor_condominio_min}
          maxValue={filters.valor_condominio_max}
          onMinChange={(v) => onFilterChange("valor_condominio_min", v)}
          onMaxChange={(v) => onFilterChange("valor_condominio_max", v)}
          placeholderMin="Mín. R$"
          placeholderMax="Máx. R$"
        />
        {/* Valor IPTU */}
        <RangeInput
          label="Valor IPTU"
          minValue={filters.valor_iptu_min}
          maxValue={filters.valor_iptu_max}
          onMinChange={(v) => onFilterChange("valor_iptu_min", v)}
          onMaxChange={(v) => onFilterChange("valor_iptu_max", v)}
          placeholderMin="Mín. R$"
          placeholderMax="Máx. R$"
        />
      </TabsContent>

      {/* ── Tab: Características ── */}
      <TabsContent value="caracteristicas" className="space-y-5">
        {isEnriching && (
          <p className="text-xs text-muted-foreground animate-pulse">
            Carregando características disponíveis...
          </p>
        )}
        <CheckboxGroup
          title="Características do Imóvel"
          options={availableFeatures.caracteristicas}
          selected={featCaracSet}
          onChange={(v) => onFilterChange("feat_caracteristicas", v)}
        />
        <CheckboxGroup
          title="Condomínio"
          options={availableFeatures.condominio}
          selected={featCondSet}
          onChange={(v) => onFilterChange("feat_condominio", v)}
        />
        <CheckboxGroup
          title="Segurança"
          options={availableFeatures.seguranca}
          selected={featSegSet}
          onChange={(v) => onFilterChange("feat_seguranca", v)}
        />
        {!isEnriching &&
          availableFeatures.caracteristicas.length === 0 &&
          availableFeatures.condominio.length === 0 &&
          availableFeatures.seguranca.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhuma característica disponível.
            </p>
          )}
      </TabsContent>
    </Tabs>
  );
}

/* ── Footer actions (shared) ── */
function FilterFooter({ onClear, onApply }: { onClear: () => void; onApply: () => void }) {
  return (
    <div className="flex gap-3 pt-4 border-t border-border/50">
      <Button variant="outline" className="flex-1" onClick={onClear}>
        Limpar filtros
      </Button>
      <Button className="flex-1" onClick={onApply}>
        Aplicar filtros
      </Button>
    </div>
  );
}

export function SearchBarFilterModal({
  open,
  onOpenChange,
  meta,
  filters,
  onFilterChange,
  onClear,
  onApply,
  availableFeatures,
  isEnriching,
}: SearchBarFilterModalProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filtros</DrawerTitle>
            <DrawerDescription>Refine sua busca de imóveis</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto max-h-[60vh]">
            <FilterBody
              meta={meta}
              filters={filters}
              onFilterChange={onFilterChange}
              availableFeatures={availableFeatures}
              isEnriching={isEnriching}
            />
          </div>
          <div className="px-4 pb-4">
            <FilterFooter onClear={onClear} onApply={onApply} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Filtros</DialogTitle>
          <DialogDescription>Refine sua busca de imóveis</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[60vh] pr-1">
          <FilterBody
            meta={meta}
            filters={filters}
            onFilterChange={onFilterChange}
            availableFeatures={availableFeatures}
            isEnriching={isEnriching}
          />
        </div>
        <FilterFooter onClear={onClear} onApply={onApply} />
      </DialogContent>
    </Dialog>
  );
}
