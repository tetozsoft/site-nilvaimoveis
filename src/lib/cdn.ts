import type { SiteConfig } from "@/data/config";
import type { PropertyCard, PropertyDetail, PropertyFeatures } from "@/data/properties";

const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL;
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID;

function cdnUrl(path: string): string {
  return `${CDN_URL}/${COMPANY_ID}/${path}`;
}

async function cdnFetch<T>(path: string): Promise<T> {
  const res = await fetch(cdnUrl(path));
  if (!res.ok) throw new Error(`CDN fetch failed: ${res.status} ${res.statusText}`);
  return res.json();
}

// ── Response envelope types ──

export interface DestaqueResponse {
  destaques: PropertyCard[];
  generated_at: string;
}

export interface ListagemResponse {
  items: PropertyCard[];
  page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  generated_at: string;
}

export interface MetaResponse {
  total_properties: number;
  per_page: number;
  total_pages: number;
  tipos_disponiveis: string[];
  total_venda: number;
  total_aluguel: number;
  price_range_venda: { min: number; max: number };
  price_range_aluguel: { min: number; max: number };
  available_filters: {
    quartos: number[];
    banheiros: number[];
    vagas: number[];
    area_min: number;
    area_max: number;
  };
  categories: Array<{ id: string; name: string; count: number }>;
  cities: string[];
  generated_at: string;
}

// ── Typed fetch functions (throw on failure — React Query handles retries) ──

export function fetchConfig(): Promise<SiteConfig> {
  return cdnFetch<SiteConfig>("config.json");
}

export function fetchDestaques(): Promise<DestaqueResponse> {
  return cdnFetch<DestaqueResponse>("destaques.json");
}

export function fetchListagem(page: number): Promise<ListagemResponse> {
  return cdnFetch<ListagemResponse>(`imoveis/listagem/page-${page}.json`);
}

function normalizeFeatures(raw: PropertyDetail & { comodidades?: string[] }): PropertyDetail {
  if (!raw.features && raw.comodidades) {
    raw.features = { caracteristicas: raw.comodidades, condominio: [], seguranca: [] };
  }
  if (!raw.features) {
    raw.features = { caracteristicas: [], condominio: [], seguranca: [] };
  }
  return raw;
}

export async function fetchPropertyDetail(slug: string): Promise<PropertyDetail> {
  const raw = await cdnFetch<PropertyDetail & { comodidades?: string[] }>(`imoveis/detalhe/${slug}.json`);
  return normalizeFeatures(raw);
}

export function fetchMeta(): Promise<MetaResponse> {
  return cdnFetch<MetaResponse>("meta.json");
}

// ── Server-side fetch with Next.js revalidation (for SSR/ISR) ──

export async function fetchConfigServer(): Promise<SiteConfig> {
  const res = await fetch(cdnUrl("config.json"), { next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`CDN fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchPropertyDetailServer(slug: string): Promise<PropertyDetail> {
  const res = await fetch(cdnUrl(`imoveis/detalhe/${slug}.json`), { next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`CDN fetch failed: ${res.status}`);
  const raw = await res.json();
  return normalizeFeatures(raw);
}

export async function fetchMetaServer(): Promise<MetaResponse> {
  const res = await fetch(cdnUrl("meta.json"), { next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`CDN fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchAllPropertySlugs(): Promise<string[]> {
  const meta = await fetchMetaServer();
  const slugs: string[] = [];
  for (let page = 1; page <= meta.total_pages; page++) {
    const res = await fetch(cdnUrl(`imoveis/listagem/page-${page}.json`), { next: { revalidate: 600 } });
    if (!res.ok) continue;
    const data: ListagemResponse = await res.json();
    for (const item of data.items) {
      slugs.push(item.slug);
    }
  }
  return slugs;
}
