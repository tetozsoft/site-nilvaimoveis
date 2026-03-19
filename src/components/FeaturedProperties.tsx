"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useDestaques } from "@/hooks/use-cdn";
import { useSiteConfigContext } from "@/contexts/SiteConfigContext";
import PropertyCardItem from "@/components/PropertyCardItem";

function PropertySkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-background shadow">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-3/4" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </div>
  );
}

const FeaturedProperties = () => {
  const siteConfig = useSiteConfigContext();
  const { listing } = siteConfig;
  const { data: properties, isLoading, isError } = useDestaques();

  return (
    <section id="imoveis" className="section-padding bg-secondary">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
            Imóveis em Destaque
          </span>
          <h2 className="section__title font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            {listing.title.substring(0, listing.title.lastIndexOf(" "))}
            <span className="section__highlight text-accent"> {listing.title.split(" ").pop()}</span>
          </h2>
          <p className="section__subtitle text-muted-foreground max-w-2xl mx-auto">
            {listing.subtitle}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="property-grid grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <PropertySkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <p className="text-center text-muted-foreground">
            Não foi possível carregar os imóveis.
          </p>
        )}

        {/* Properties Grid */}
        {properties && (
          <div className="property-grid grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property, index) => (
              <PropertyCardItem key={property.id} property={property} index={index} />
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link href="/imoveis">
            <Button className="btn-primary px-8 py-6 text-lg rounded-full">
              Ver Todos os Imóveis
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
