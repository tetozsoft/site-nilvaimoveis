"use client";

import { Home, Key, FileText, Calculator, Shield, Headphones } from "lucide-react";
import { useSiteConfigContext } from "@/contexts/SiteConfigContext";

const icons = [Home, Key, FileText, Calculator, Shield, Headphones];

const Services = () => {
  const siteConfig = useSiteConfigContext();
  const { services } = siteConfig;

  return (
    <section id="servicos" className="services-section section section-padding bg-primary text-primary-foreground">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-medium mb-4">
            Nossos Serviços
          </span>
          <h2 className="section__title font-display text-3xl md:text-5xl font-bold mb-4">
            {services.title}
            <span className="section__highlight text-accent"> {services.title_highlight}</span>
          </h2>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto">
            {services.subtitle}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.cards.map((card, index) => {
            const Icon = icons[index % icons.length];
            return (
              <div
                key={card.title}
                className="services-card group p-8 rounded-2xl bg-primary-foreground/5 hover:bg-primary-foreground/10 border border-primary-foreground/10 transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center mb-6 group-hover:bg-accent transition-colors duration-300">
                  <Icon className="w-7 h-7 text-accent group-hover:text-accent-foreground transition-colors duration-300" />
                </div>

                <h3 className="font-display text-xl font-semibold mb-3">
                  {card.title}
                </h3>

                <p className="text-primary-foreground/70 leading-relaxed">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
