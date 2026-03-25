import type { Metadata } from "next";
import { fetchPropertyDetailServer, fetchConfigServer, fetchAllPropertySlugs } from "@/lib/cdn";
import { formatCurrency } from "@/lib/utils";
import { PropertyDetailsClient } from "./PropertyDetailsClient";

export const runtime = 'edge';
export const revalidate = 600; // ISR: revalidate every 10 minutes

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const [property, config] = await Promise.all([
      fetchPropertyDetailServer(id),
      fetchConfigServer(),
    ]);

    const title = property.meta_title || `${property.titulo} - ${config.company_name}`;
    const description =
      property.meta_description ||
      `${property.tipo ? property.tipo + " " : ""}com ${property.quartos} quartos em ${property.endereco.cidade}. ${formatCurrency(property.valor_venda ?? property.valor_aluguel)}`;

    const ogImage = property.photos[0]?.full;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630 }] }),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        ...(ogImage && { images: [ogImage] }),
      },
    };
  } catch {
    return {
      title: "Imóvel não encontrado",
    };
  }
}

export async function generateStaticParams() {
  try {
    const slugs = await fetchAllPropertySlugs();
    return slugs.map((slug) => ({ id: slug }));
  } catch {
    return [];
  }
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Try to fetch property data server-side for JSON-LD
  let jsonLd: object | null = null;
  try {
    const [property, config] = await Promise.all([
      fetchPropertyDetailServer(id),
      fetchConfigServer(),
    ]);

    const locationStr = [property.endereco.bairro, property.endereco.cidade].filter(Boolean).join(", ");

    jsonLd = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      name: property.titulo,
      description: property.descricao,
      url: `${config.contact.website || ""}/imovel/${property.slug}`,
      image: property.photos.map((p) => p.full),
      address: {
        "@type": "PostalAddress",
        addressLocality: property.endereco.cidade,
        addressRegion: property.endereco.estado,
        streetAddress: property.endereco.logradouro
          ? `${property.endereco.logradouro}${property.endereco.numero ? `, ${property.endereco.numero}` : ""}`
          : undefined,
        postalCode: property.endereco.cep,
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
      floorSize: property.area_total
        ? { "@type": "QuantitativeValue", value: property.area_total, unitCode: "MTK" }
        : undefined,
      broker: {
        "@type": "RealEstateAgent",
        name: config.company_name,
        telephone: config.contact.phone,
        email: config.contact.email,
      },
    };
  } catch {
    // Property not found server-side — client will handle
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PropertyDetailsClient slug={id} />
    </>
  );
}
