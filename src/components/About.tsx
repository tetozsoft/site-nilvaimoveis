"use client";

import { Award, Users, Home, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteConfigContext } from "@/contexts/SiteConfigContext";

const About = () => {
  const siteConfig = useSiteConfigContext();
  const { about } = siteConfig;

  const stats = [
    { icon: Home, value: `${about.stats.sold_properties}+`, label: "Imóveis Vendidos" },
    { icon: Users, value: `${about.stats.satisfied_clients.toLocaleString("pt-BR")}+`, label: "Clientes Satisfeitos" },
    { icon: Award, value: `${about.stats.years_market}+`, label: "Anos no Mercado" },
    { icon: MapPin, value: `${about.stats.neighborhoods}+`, label: "Bairros Atendidos" },
  ];

  return (
    <section id="sobre" className="about-section section section-padding bg-background">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src={about.image_url}
                alt={`Equipe ${siteConfig.company_name}`}
                className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/5]"
              />
            </div>
            {/* Decorative Elements */}
            <div className="absolute -bottom-6 -right-6 w-2/3 h-2/3 bg-accent/10 rounded-2xl -z-0" />
            <div className="absolute -top-6 -left-6 w-32 h-32 border-2 border-accent rounded-2xl -z-0" />

            {/* Experience Badge */}
            <div className="absolute -right-4 md:-right-8 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground p-6 rounded-2xl shadow-xl z-20">
              <div className="text-center">
                <span className="text-4xl font-display font-bold text-accent">{about.stats.years_market}+</span>
                <p className="text-sm mt-1 text-primary-foreground/80">Anos de<br />Experiência</p>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div>
            <span className="inline-block px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium mb-6">
              Sobre Nós
            </span>

            <h2 className="section__title font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
              {about.title}
              <span className="section__highlight text-accent"> {about.title_highlight}</span>
            </h2>

            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              {about.subtitle}
            </p>

            <p className="text-muted-foreground mb-8 leading-relaxed">
              {about.description}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="flex items-center gap-4 p-4 bg-secondary rounded-xl"
                  >
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <div className="text-2xl font-display font-bold text-foreground">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button className="btn-accent px-8 py-6 text-lg rounded-full">
              Conheça Nossa Equipe
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
