"use client";

import { useSiteConfigContext } from "@/contexts/SiteConfigContext";
import { SearchBar } from "@/components/SearchBar";

const Hero = () => {
  const siteConfig = useSiteConfigContext();
  const { banner, about } = siteConfig;

  return (
    <section id="inicio" className="hero relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${banner.bg_url}')`,
        }}
      />

      {/* Overlay */}
      <div
        className="hero__overlay absolute inset-0"
        style={{ background: 'var(--hero-overlay)' }}
      />

      {/* Content */}
      <div className="relative z-10 container-custom text-center pt-20">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-medium mb-6 animate-fade-up opacity-0">
            Sua casa dos sonhos está aqui
          </span>

          <h1 className="hero__title font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 animate-fade-up opacity-0 delay-100">
            {banner.title.split(" ").slice(0, 3).join(" ")}
            <span className="block text-accent">{banner.title.split(" ").slice(3).join(" ")}</span>
          </h1>

          <p className="hero__subtitle text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto animate-fade-up opacity-0 delay-200">
            {banner.subtitle}
          </p>

          <SearchBar />

          {/* Stats */}
          {banner.show_stats && (
            <div className="hero__stats flex flex-wrap justify-center gap-8 md:gap-16 mt-12 animate-fade-up opacity-0 delay-400">
              {[
                { value: `${about.stats.sold_properties}+`, label: "Imóveis Disponíveis" },
                { value: `${about.stats.satisfied_clients.toLocaleString("pt-BR")}+`, label: "Clientes Satisfeitos" },
                { value: `${about.stats.years_market}+`, label: "Anos de Experiência" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-display font-bold text-accent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-primary-foreground/70 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-primary-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
