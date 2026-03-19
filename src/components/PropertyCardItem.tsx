"use client";

import { Bed, Bath, Car, Maximize, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { PropertyCard } from "@/data/properties";

interface PropertyCardItemProps {
  property: PropertyCard;
  index?: number;
}

const PropertyCardItem = ({ property, index = 0 }: PropertyCardItemProps) => {
  const locationStr = [property.endereco.bairro, property.endereco.cidade].filter(Boolean).join(", ");

  return (
    <article
      className="property-card group"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image */}
      <div className="property-card__image relative overflow-hidden aspect-[4/3]">
        <img
          src={property.photo_urls.thumb}
          alt={property.titulo}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        {property.tags.length > 0 && (
          <span className="property-card__badge absolute top-4 left-4 px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
            {property.tags[0]}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="property-card__content p-6">
        {locationStr && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">{locationStr}</span>
          </div>
        )}

        <h3 className="property-card__title font-display text-xl font-semibold text-foreground mb-3 group-hover:text-accent transition-colors line-clamp-2">
          {property.titulo}
        </h3>

        {/* Features */}
        <div className="property-card__meta flex items-center gap-4 text-sm text-muted-foreground mb-4 pb-4 border-b border-border">
          <span className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            {property.quartos}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            {property.banheiros}
          </span>
          <span className="flex items-center gap-1">
            <Car className="w-4 h-4" />
            {property.vagas_garagem}
          </span>
          {property.area_total != null && (
            <span className="flex items-center gap-1">
              <Maximize className="w-4 h-4" />
              {property.area_total}m²
            </span>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground">A partir de</span>
            <p className="property-card__price text-xl font-bold text-foreground">{property.preco_formatado}</p>
          </div>
          <Link href={`/imovel/${property.slug}`}>
            <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all">
              Ver Detalhes
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PropertyCardItem;
