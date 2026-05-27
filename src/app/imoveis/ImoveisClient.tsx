"use client";

import { useEffect, useRef } from "react";
import { BadgeCheck, Calculator, ChevronLeft, ChevronRight, Grid3X3, List, MessageCircle, Search, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCardItem from "@/components/PropertyCardItem";
import { SearchBar } from "@/components/SearchBar";
import { useAllProperties } from "@/hooks/use-all-properties";
import { usePropertyFilters } from "@/hooks/use-property-filters";
import { useSiteConfigContext } from "@/contexts/SiteConfigContext";
import { whatsappUrl } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";

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

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "ellipsis")[] = [1];
  if (current > 3) pages.push("ellipsis");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

export function ImoveisClient() {
  const siteConfig = useSiteConfigContext();
  const caixaWhatsAppMessage =
    "Olá, quero simular financiamento habitacional pela CAIXA com a Nilva Imóveis.";
  const { properties: allProperties, isLoading, isError, progress } =
    useAllProperties();

  const {
    filters,
    setFilter,
    removeFilter,
    clearAllFilters,
    activeFilters,
    paginatedProperties,
    totalFiltered,
    totalPages,
    currentPage,
  } = usePropertyFilters(allProperties);

  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gridRef.current && Number(filters.pagina) > 1) {
      gridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [filters.pagina]);

  const goToPage = (page: number) => {
    setFilter("pagina", String(page));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="listing-shell">
        <section className="listing-hero">
          <div
            className="listing-hero__bg"
            style={{ backgroundImage: `url('${siteConfig.banner.bg_url}')` }}
          />
          <div className="listing-hero__overlay" />
          <div className="container-custom listing-hero__content">
            <span>Venda e locação</span>
            <h1>Imóveis disponíveis</h1>
            <p>{siteConfig.listing.subtitle}</p>
          </div>
        </section>

        <div className="container-custom listing-layout" ref={gridRef}>
          <aside className="listing-sidebar">
            <SearchBar />
          </aside>

          <section className="listing-results">
            <div className="listing-caixa-banner">
              <div>
                <span>
                  <BadgeCheck className="h-4 w-4" />
                  Correspondente CAIXA Aqui
                </span>
                <h2>Compre com financiamento CAIXA</h2>
                <p>Simule, organize documentos e encaminhe sua proposta com atendimento Nilva.</p>
              </div>
              <a
                href={whatsappUrl(siteConfig.contact.celular, caixaWhatsAppMessage)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Calculator className="h-4 w-4" />
                Simular financiamento
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>

            {isLoading && (
              <>
                {progress > 0 && progress < 1 && (
                  <div className="listing-progress">
                    <div>
                      <span>Carregando imóveis...</span>
                      <span>{Math.round(progress * 100)}%</span>
                    </div>
                    <Progress value={progress * 100} className="h-1.5" />
                  </div>
                )}
                <div className="property-grid">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <PropertySkeleton key={i} />
                  ))}
                </div>
              </>
            )}

            {isError && !isLoading && (
              <div className="listing-empty">
                <div>
                  <X className="h-8 w-8" />
                </div>
                <h2>Erro ao carregar imóveis</h2>
                <p>Não foi possível conectar ao servidor. Tente novamente.</p>
                <Button onClick={() => window.location.reload()}>
                  Tentar novamente
                </Button>
              </div>
            )}

            {!isLoading && !isError && (
              <>
                <div className="listing-toolbar">
                  <div className="listing-toolbar__count">
                    <span className="num">{totalFiltered}</span>{" "}
                    {totalFiltered === 1 ? "imóvel encontrado" : "imóveis encontrados"}
                  </div>

                  <div className="listing-toolbar__controls">
                    <div className="listing-toolbar__view" aria-hidden="true">
                      <button type="button" className="active">
                        <Grid3X3 className="h-4 w-4" />
                      </button>
                      <button type="button">
                        <List className="h-4 w-4" />
                      </button>
                    </div>

                    <label className="listing-toolbar__sort">
                      <span>Ordenar por</span>
                      <select value={filters.ordenar || "recente"} onChange={(e) => setFilter("ordenar", e.target.value)}>
                        <option value="recente">data mais recente</option>
                        <option value="preco_asc">menor preço</option>
                        <option value="preco_desc">maior preço</option>
                        <option value="area_desc">maior área</option>
                      </select>
                    </label>
                  </div>
                </div>

                {activeFilters.length > 0 && (
                  <div className="listing-criteria">
                    <h3>Filtrando por:</h3>
                    <ul>
                      {activeFilters.map((filter) => (
                        <li key={filter.key}>
                          <button type="button" onClick={() => removeFilter(filter.key)}>
                            <span className="close">x</span>
                            <span>{filter.value}</span>
                          </button>
                        </li>
                      ))}
                      <li>
                        <button type="button" onClick={clearAllFilters}>
                          <span className="close">x</span>
                          <span>limpar filtros</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                )}

                {totalFiltered === 0 && (
                  <div className="listing-empty">
                    <div>
                      <Search className="h-8 w-8" />
                    </div>
                    <h2>Nenhum imóvel encontrado</h2>
                    <p>Tente ajustar os filtros para encontrar mais resultados.</p>
                    <Button variant="outline" onClick={clearAllFilters}>
                      Limpar filtros
                    </Button>
                  </div>
                )}

                {totalFiltered > 0 && (
                  <>
                    <div className="property-grid">
                      {paginatedProperties.map((property, index) => (
                        <PropertyCardItem
                          key={property.id}
                          property={property}
                          index={index}
                        />
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="listing-pagination">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationLink
                                onClick={() =>
                                  currentPage > 1 && goToPage(currentPage - 1)
                                }
                                className={`gap-1 pl-2.5 cursor-pointer select-none ${
                                  currentPage <= 1
                                    ? "pointer-events-none opacity-50"
                                    : ""
                                }`}
                              >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">Anterior</span>
                              </PaginationLink>
                            </PaginationItem>

                            {getPageNumbers(currentPage, totalPages).map(
                              (page, i) =>
                                page === "ellipsis" ? (
                                  <PaginationItem key={`ellipsis-${i}`} className="hidden sm:block">
                                    <PaginationEllipsis />
                                  </PaginationItem>
                                ) : (
                                  <PaginationItem key={page} className="hidden sm:block">
                                    <PaginationLink
                                      isActive={page === currentPage}
                                      onClick={() => goToPage(page)}
                                      className="cursor-pointer"
                                    >
                                      {page}
                                    </PaginationLink>
                                  </PaginationItem>
                                ),
                            )}

                            <PaginationItem className="sm:hidden">
                              <span className="flex h-9 items-center px-3 text-sm text-muted-foreground">
                                {currentPage} / {totalPages}
                              </span>
                            </PaginationItem>

                            <PaginationItem>
                              <PaginationLink
                                onClick={() =>
                                  currentPage < totalPages &&
                                  goToPage(currentPage + 1)
                                }
                                className={`gap-1 pr-2.5 cursor-pointer select-none ${
                                  currentPage >= totalPages
                                    ? "pointer-events-none opacity-50"
                                    : ""
                                }`}
                              >
                                <span className="hidden sm:inline">Próxima</span>
                                <ChevronRight className="h-4 w-4" />
                              </PaginationLink>
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
