"use client";

import { Building2, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useDestaques, useMeta } from "@/hooks/use-cdn";
import { useSiteConfigContext } from "@/contexts/SiteConfigContext";
import { whatsappUrl } from "@/lib/utils";
import PropertyCardItem from "@/components/PropertyCardItem";

function PropertySkeleton() {
  return (
    <div className="property-card property-card--skeleton">
      <Skeleton className="property-card__image" />
      <div className="property-card__middle">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-7 w-4/5" />
        <Skeleton className="h-5 w-3/4" />
      </div>
      <div className="property-card__bottom">
        <Skeleton className="h-7 w-32" />
      </div>
    </div>
  );
}

const FeaturedProperties = () => {
  const siteConfig = useSiteConfigContext();
  const { listing } = siteConfig;
  const { data: properties, isLoading, isError } = useDestaques();
  const { data: meta } = useMeta();

  const popularSearches = [
    ...(meta?.cities ?? []).slice(0, 6).map((city) => ({
      label: `Imóveis em ${city}`,
      href: `/imoveis?cidade=${encodeURIComponent(city)}`,
      count: null as number | null,
    })),
    { label: "Imóveis à venda", href: "/imoveis?transacao=venda", count: meta?.total_venda ?? null },
    { label: "Imóveis para alugar", href: "/imoveis?transacao=aluguel", count: meta?.total_aluguel ?? null },
  ];

  return (
    <section id="imoveis" className="featured-section section-padding">
      <div className="container-custom">
        <div className="section-heading section-heading--splendido">
          <span>Imóveis em Destaque</span>
          <h2>
            {listing.title}
          </h2>
          <p>{listing.subtitle}</p>
        </div>

        {isLoading && (
          <div className="property-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertySkeleton key={i} />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-center text-muted-foreground">
            Não foi possível carregar os imóveis.
          </p>
        )}

        {properties && (
          <div className="property-grid">
            {properties.map((property, index) => (
              <PropertyCardItem key={property.id} property={property} index={index} />
            ))}
          </div>
        )}

        <div className="featured-section__all">
          <Link href="/imoveis">
            <Button className="btn-primary">
              Ver todos os imóveis
            </Button>
          </Link>
        </div>

        {popularSearches.length > 0 && (
          <div className="popular-searches">
            <h2>Buscas Populares</h2>
            <ul>
              {popularSearches.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                  {item.count != null && <span>{item.count}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="splendido-cta-grid">
          <a href={whatsappUrl(siteConfig.contact.celular, "Olá, quero vender meu imóvel.")} target="_blank" rel="noopener noreferrer">
            <Building2 className="h-8 w-8" />
            <strong>Quer vender seu imóvel?</strong>
            <span>Cadastre-se e anuncie conosco</span>
          </a>
          <a href={whatsappUrl(siteConfig.contact.celular, "Olá, não encontrei o imóvel que procuro.")} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-8 w-8" />
            <strong>Não encontrou o que procurava?</strong>
            <span>Entre em contato</span>
          </a>
          <Link href="/imoveis">
            <Heart className="h-8 w-8" />
            <strong>Meus imóveis favoritos</strong>
            <span>Monte sua lista durante a busca</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
