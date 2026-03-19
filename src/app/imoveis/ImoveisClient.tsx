"use client";

import { useEffect, useRef } from "react";
import { Search, X, ChevronRight, ChevronLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCardItem from "@/components/PropertyCardItem";
import { SearchBar } from "@/components/SearchBar";
import { useAllProperties } from "@/hooks/use-all-properties";
import { usePropertyFilters } from "@/hooks/use-property-filters";
import { useSiteConfigContext } from "@/contexts/SiteConfigContext";

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

// ── Skeleton grid ──
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

// ── Pagination helpers ──
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

// ── Main page ──
export function ImoveisClient() {
  const siteConfig = useSiteConfigContext();
  const { properties: allProperties, meta, isLoading, isError, progress } =
    useAllProperties();

  const {
    filters,
    setFilter,
    clearAllFilters,
    paginatedProperties,
    totalFiltered,
    totalPages,
    currentPage,
  } = usePropertyFilters(allProperties);

  const gridRef = useRef<HTMLDivElement>(null);

  // Scroll to top of grid when page changes
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

      {/* Hero banner with filters */}
      <section className="relative overflow-hidden pt-28 md:pt-32 pb-8 md:pb-10">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${siteConfig.banner.bg_url}')` }}
        />
        {/* Overlay */}
        <div className="hero__overlay absolute inset-0" style={{ background: "var(--hero-overlay)" }} />

        {/* Filter bar */}
        <div className="relative z-10 container-custom">
          <SearchBar />
        </div>
      </section>

      {/* Main content */}
      <main className="flex-1 bg-secondary">
        <div className="container-custom py-8 md:py-12" ref={gridRef}>
          {/* Loading state */}
          {isLoading && (
            <>
              {progress > 0 && progress < 1 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>Carregando imóveis...</span>
                    <span>{Math.round(progress * 100)}%</span>
                  </div>
                  <Progress value={progress * 100} className="h-1.5" />
                </div>
              )}
              <div className="property-grid grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <PropertySkeleton key={i} />
                ))}
              </div>
            </>
          )}

          {/* Error state */}
          {isError && !isLoading && (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <X className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Erro ao carregar imóveis
              </h2>
              <p className="text-muted-foreground mb-6">
                Não foi possível conectar ao servidor. Tente novamente.
              </p>
              <Button onClick={() => window.location.reload()}>
                Tentar novamente
              </Button>
            </div>
          )}

          {/* Loaded content */}
          {!isLoading && !isError && (
            <>
              {/* Results count */}
              <p className="text-muted-foreground text-sm mb-6">
                <span className="font-semibold text-foreground">
                  {totalFiltered}
                </span>{" "}
                {totalFiltered === 1 ? "imóvel encontrado" : "imóveis encontrados"}
              </p>

              {/* Empty state */}
              {totalFiltered === 0 && (
                <div className="text-center py-20">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Nenhum imóvel encontrado
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Tente ajustar os filtros para encontrar mais resultados.
                  </p>
                  <Button variant="outline" onClick={clearAllFilters}>
                    Limpar filtros
                  </Button>
                </div>
              )}

              {/* Grid */}
              {totalFiltered > 0 && (
                <>
                  <div className="property-grid grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {paginatedProperties.map((property, index) => (
                      <PropertyCardItem
                        key={property.id}
                        property={property}
                        index={index}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12">
                      <Pagination>
                        <PaginationContent>
                          {/* Previous */}
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

                          {/* Page numbers */}
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

                          {/* Mobile page indicator */}
                          <PaginationItem className="sm:hidden">
                            <span className="flex h-9 items-center px-3 text-sm text-muted-foreground">
                              {currentPage} / {totalPages}
                            </span>
                          </PaginationItem>

                          {/* Next */}
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
