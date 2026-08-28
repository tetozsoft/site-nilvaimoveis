import { fetchAllPropertyCardsServer, fetchConfigServer } from "@/lib/cdn";
import type { PropertyCard } from "@/data/properties";
import { canonicalUrl, getCanonicalBaseUrl } from "@/lib/seo";
import { formatCurrency, transactionTypeLabel } from "@/lib/utils";

export const dynamic = "force-static";

function clean(value: string | null | undefined): string {
  return (value || "").replace(/\s+/g, " ").trim();
}

function formatArea(value: number | null): string {
  return value ? `${value} m2` : "";
}

function countLabel(value: number, singular: string, plural: string): string {
  return value ? `${value} ${value === 1 ? singular : plural}` : "";
}

function propertyLine(property: PropertyCard, baseUrl: string): string {
  const url = canonicalUrl(`/imovel/${encodeURIComponent(property.slug)}`, baseUrl);
  const price =
    clean(property.preco_formatado) ||
    formatCurrency(property.valor_venda ?? property.valor_aluguel);
  const location = [property.endereco.bairro, property.endereco.cidade, property.endereco.estado]
    .filter(Boolean)
    .join(", ");
  const details = [
    clean(property.tipo),
    transactionTypeLabel(property.transaction_type),
    clean(property.finalidade),
    price,
    clean(location),
    countLabel(property.quartos, "quarto", "quartos"),
    countLabel(property.banheiros, "banheiro", "banheiros"),
    countLabel(property.vagas_garagem, "vaga", "vagas"),
    formatArea(property.area_total),
    property.tags?.length ? `tags: ${property.tags.join(", ")}` : "",
  ].filter(Boolean);

  return `- [${clean(property.titulo) || "Imovel"}](${url}): ${details.join(" | ")}.`;
}

export async function GET() {
  const [config, properties] = await Promise.all([
    fetchConfigServer().catch(() => null),
    fetchAllPropertyCardsServer().catch(() => []),
  ]);
  const baseUrl = getCanonicalBaseUrl(config?.contact?.website);
  const companyName = config?.company_name || "Nilva Imoveis";

  const lines = [
    `# ${companyName}`,
    "",
    "> Imobiliaria em Vargem Grande do Sul, SP, com imoveis para venda e aluguel e atendimento para financiamento habitacional pela CAIXA.",
    "",
    `${companyName} ajuda clientes a encontrar, comprar, vender e alugar imoveis. O site publica catalogo imobiliario, detalhes de imoveis, fotos, valores, localizacao por bairro/cidade e canais de contato via WhatsApp.`,
    "",
    "Use o sitemap XML para descobrir a lista completa e atualizada de URLs. Valores e disponibilidade podem mudar conforme novas ofertas entram ou saem do catalogo.",
    "",
    "## Paginas Principais",
    "",
    `- [Inicio](${canonicalUrl("/", baseUrl)}): busca rapida, destaques, financiamento CAIXA, servicos e contato.`,
    `- [Imoveis](${canonicalUrl("/imoveis", baseUrl)}): catalogo com filtros por cidade, bairro, transacao, quartos, banheiros, vagas e faixa de preco.`,
    `- [Financiamento CAIXA](${canonicalUrl("/#financiamento-caixa", baseUrl)}): atendimento para simulacao, documentacao e encaminhamento de proposta de financiamento habitacional.`,
    `- [Sitemap XML](${canonicalUrl("/sitemap.xml", baseUrl)}): URLs canonicas de home, listagem e paginas de imoveis.`,
    "",
    "## Catalogo De Imoveis",
    "",
    ...properties.map((property) => propertyLine(property, baseUrl)),
    "",
    "## Dados Estruturados",
    "",
    "- As paginas de imovel usam JSON-LD `RealEstateListing`.",
    "- A home usa JSON-LD `RealEstateAgent`.",
    "- URLs canonicas usam `https://nilvaimoveis.com`.",
    "",
    "## Contato",
    "",
    `- Site: ${baseUrl}`,
    `- WhatsApp: ${config?.contact?.celular || "(19) 99843-4363"}`,
    `- E-mail: ${config?.contact?.email || "josemarcosmerlin15@gmail.com"}`,
    `- CRECI: ${config?.creci || "328907"}`,
    "",
    "## Observacoes Para Agentes",
    "",
    "- Nao trate valores, disponibilidade ou detalhes de imoveis como permanentes.",
    "- Para respostas ao usuario final, prefira encaminhar para contato direto com a Nilva Imoveis quando houver duvida sobre disponibilidade, preco, financiamento ou documentacao.",
    "- A empresa se apresenta no site como Correspondente CAIXA Aqui; financiamento e credito dependem das regras e analise da CAIXA.",
  ];

  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
