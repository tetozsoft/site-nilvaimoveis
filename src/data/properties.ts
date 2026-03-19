// ── CDN API-aligned types ──

export interface Endereco {
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro: string | null;
  cidade: string;
  estado: string;
  latitude?: number;
  longitude?: number;
}

export interface PhotoUrls {
  thumb: string;
  medium: string;
  full: string;
  titulo: string | null;
  descricao: string | null;
}

export interface Corretor {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  celular: string | null;
  creci: string;
  creci_estado: string;
  avatar_url: string | null;
}

export interface PropertyCard {
  id: string;
  slug: string;
  titulo: string;
  transaction_type: "venda" | "aluguel" | "venda_aluguel";
  valor_venda: number | null;
  valor_aluguel: number | null;
  preco_formatado: string;
  tipo: string | null;
  finalidade: string | null;
  tags: string[];
  area_total: number | null;
  quartos: number;
  banheiros: number;
  vagas_garagem: number;
  endereco: Endereco;
  photo_urls: PhotoUrls;
  destaque: boolean;
  publicado_em: string;
}

export interface PropertyFeatures {
  caracteristicas: string[];
  condominio: string[];
  seguranca: string[];
}

export interface PropertyDetail extends PropertyCard {
  descricao: string;
  status: string;
  codigo: string;
  suites: number;
  salas: number;
  andares: number;
  andar?: number;
  area_construida: number | null;
  area_terreno: number | null;
  tem_condominio: boolean;
  nome_condominio: string | null;
  ano_construcao: number;
  aceita_financiamento: boolean;
  aceita_permuta: boolean;
  mobiliado: boolean;
  features: PropertyFeatures;
  valor_condominio: number | null;
  valor_iptu: number | null;
  matricula_imovel: string | null;
  cartorio_registro: string | null;
  endereco: Endereco;
  corretor: Corretor;
  photos: PhotoUrls[];
  videos: string[];
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export type EnrichedProperty = PropertyCard & {
  suites?: number;
  salas?: number;
  andares?: number;
  andar?: number | null;
  area_construida?: number | null;
  area_terreno?: number | null;
  tem_condominio?: boolean;
  nome_condominio?: string | null;
  ano_construcao?: number | null;
  aceita_financiamento?: boolean;
  aceita_permuta?: boolean;
  mobiliado?: boolean;
  features?: PropertyFeatures;
  valor_condominio?: number | null;
  valor_iptu?: number | null;
  _enriched: boolean;
};
