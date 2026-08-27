"use client";

import { Bath, Bed, Car, Heart, MapPin, Maximize } from "lucide-react";
import Link from "next/link";
import type { PropertyCard } from "@/data/properties";
import { transactionTypeLabel } from "@/lib/utils";

interface PropertyCardItemProps {
  property: PropertyCard;
  index?: number;
}

const PropertyCardItem = ({ property, index = 0 }: PropertyCardItemProps) => {
  const locationStr = [property.endereco.cidade, property.endereco.bairro].filter(Boolean).join(" - ");
  const primaryTag = property.tags[0] || transactionTypeLabel(property.transaction_type);

  return (
    <article className="property-card group" style={{ animationDelay: `${index * 80}ms` }}>
      <Link href={`/imovel/${property.slug}`} className="property-card__main" aria-label={`Ver detalhes de ${property.titulo}`}>
        <figure className="property-card__image">
          <img src={property.photo_urls.thumb} alt={property.titulo} loading="lazy" />
        </figure>

        {primaryTag && <div className="property-card__badge">{primaryTag}</div>}

        <div className="property-card__middle">
          {locationStr && (
            <p className="property-card__location">
              <MapPin className="h-4 w-4" />
              {locationStr}
            </p>
          )}

          <h3 className="property-card__title">{property.titulo}</h3>

          <div className="property-card__meta">
            {property.quartos > 0 && (
              <span title={`${property.quartos} dormitórios`}>
                <em>{property.quartos}</em>
                <Bed className="h-4 w-4" />
              </span>
            )}
            {property.banheiros > 0 && (
              <span title={`${property.banheiros} banheiros`}>
                <em>{property.banheiros}</em>
                <Bath className="h-4 w-4" />
              </span>
            )}
            {property.vagas_garagem > 0 && (
              <span title={`${property.vagas_garagem} vagas`}>
                <em>{property.vagas_garagem}</em>
                <Car className="h-4 w-4" />
              </span>
            )}
            {property.area_total != null && (
              <span title={`${property.area_total}m²`}>
                <em>{property.area_total}m²</em>
                <Maximize className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="property-card__bottom">
        <p className="property-card__price">{property.preco_formatado}</p>
        <span className="property-card__favorite" aria-hidden="true">
          <Heart className="h-5 w-5" />
        </span>
      </div>
    </article>
  );
};

export default PropertyCardItem;
