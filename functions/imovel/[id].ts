interface Env {
  ASSETS: Fetcher;
  CDN_URL: string;
  COMPANY_ID: string;
}

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const response = await context.env.ASSETS.fetch(context.request);

  // Static page exists — return as-is (it already has correct OG tags from build)
  if (response.status !== 404) return response;

  const url = new URL(context.request.url);
  const slug = url.pathname.split("/").pop();

  // Direct access to fallback page or missing slug — just serve fallback
  if (!slug || slug === "_") {
    url.pathname = "/imovel/_";
    return context.env.ASSETS.fetch(new Request(url, context.request));
  }

  const cdnBase = context.env.CDN_URL;
  const companyId = context.env.COMPANY_ID;

  // If env vars not configured, serve fallback as-is
  if (!cdnBase || !companyId) {
    url.pathname = "/imovel/_";
    return context.env.ASSETS.fetch(new Request(url, context.request));
  }

  // Fetch fallback HTML, property data, and config in parallel
  const fallbackUrl = new URL(context.request.url);
  fallbackUrl.pathname = "/imovel/_";

  const [fallbackResponse, propertyResponse, configResponse] = await Promise.all([
    context.env.ASSETS.fetch(new Request(fallbackUrl, context.request)),
    fetch(`${cdnBase}/${companyId}/imoveis/detalhe/${slug}.json`, { cf: { cacheTtl: 600 } }).catch(
      () => null,
    ),
    fetch(`${cdnBase}/${companyId}/config.json`, { cf: { cacheTtl: 600 } }).catch(() => null),
  ]);

  // If property data unavailable, serve fallback as-is
  if (!propertyResponse?.ok) {
    return fallbackResponse;
  }

  let property: Record<string, unknown>;
  let config: Record<string, unknown> | null = null;

  try {
    property = (await propertyResponse.json()) as Record<string, unknown>;
  } catch {
    return fallbackResponse;
  }

  if (configResponse?.ok) {
    try {
      config = (await configResponse.json()) as Record<string, unknown>;
    } catch {
      // Continue without config
    }
  }

  const contact = (config?.contact as Record<string, string>) || {};
  const siteName = (config?.site_name as string) || "";
  const companyName = (config?.company_name as string) || "";
  const siteUrl = contact.website?.replace(/\/$/, "") || "";
  const endereco = (property.endereco as Record<string, string>) || {};
  const photos = (property.photos as Array<Record<string, string>>) || [];

  const title =
    (property.meta_title as string) ||
    `${property.titulo || "Imóvel"} - ${companyName}`;
  const description =
    (property.meta_description as string) ||
    `${property.tipo || "Imóvel"} com ${property.quartos || 0} quartos em ${endereco.cidade || ""}`;
  const ogImage = photos[0]?.full || ((config?.banner as Record<string, string>)?.bg_url) || "";
  const pageUrl = `${siteUrl}/imovel/${slug}`;

  // Build JSON-LD (trusted CDN data, not user input)
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.titulo,
    description: property.descricao,
    url: pageUrl,
    image: photos.map((p) => p.full).filter(Boolean),
    address: {
      "@type": "PostalAddress",
      addressLocality: endereco.cidade,
      addressRegion: endereco.estado,
    },
    ...(property.valor_venda != null && {
      offers: {
        "@type": "Offer",
        price: property.valor_venda,
        priceCurrency: "BRL",
        availability: "https://schema.org/InStock",
      },
    }),
    numberOfRooms: property.quartos,
    numberOfBathroomsTotal: property.banheiros,
    ...(config && {
      broker: {
        "@type": "RealEstateAgent",
        name: companyName,
        telephone: contact.phone,
        email: contact.email,
      },
    }),
  });

  const metaTags = [
    `<meta property="og:title" content="${escapeAttr(title)}" />`,
    `<meta property="og:description" content="${escapeAttr(description)}" />`,
    `<meta property="og:image" content="${escapeAttr(ogImage)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${escapeAttr(pageUrl)}" />`,
    `<meta property="og:locale" content="pt_BR" />`,
    siteName ? `<meta property="og:site_name" content="${escapeAttr(siteName)}" />` : "",
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttr(title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(description)}" />`,
    `<meta name="twitter:image" content="${escapeAttr(ogImage)}" />`,
    `<script type="application/ld+json">${jsonLd}</script>`,
  ]
    .filter(Boolean)
    .join("\n    ");

  return new HTMLRewriter()
    .on("title", {
      element(element) {
        element.setInnerContent(`${title} | ${siteName}`);
      },
    })
    .on('meta[name="description"]', {
      element(element) {
        element.setAttribute("content", description);
      },
    })
    .on("head", {
      element(element) {
        element.append(metaTags, { html: true });
      },
    })
    .transform(fallbackResponse);
};
