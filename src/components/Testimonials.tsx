"use client";

import { Star, Quote } from "lucide-react";
import { useSiteConfigContext } from "@/contexts/SiteConfigContext";

const Testimonials = () => {
  const siteConfig = useSiteConfigContext();
  const { testimonials } = siteConfig;

  return (
    <section className="testimonials-section section section-padding bg-secondary">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
            Depoimentos
          </span>
          <h2 className="section__title font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            {testimonials.title}
            <span className="section__highlight text-accent"> {testimonials.title_highlight}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {testimonials.subtitle}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.items.map((item) => (
            <article
              key={item.name}
              className="testimonial-card bg-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              {/* Quote Icon */}
              <Quote className="w-10 h-10 text-accent/20 mb-4" />

              {/* Content */}
              <p className="text-foreground/80 mb-6 leading-relaxed">
                &ldquo;{item.text}&rdquo;
              </p>

              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img
                  src={item.photo_url}
                  alt={item.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-display font-semibold text-foreground">
                    {item.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {item.role}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
