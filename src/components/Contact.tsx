"use client";

import { useState } from "react";
import { Phone, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteConfigContext } from "@/contexts/SiteConfigContext";
import { whatsappUrl } from "@/lib/utils";

const Contact = () => {
  const siteConfig = useSiteConfigContext();
  const [formData, setFormData] = useState({ name: "", message: "" });

  const whatsappNumber = siteConfig.contact.celular.replace(/\D/g, "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = formData.name.trim();
    const message = formData.message.trim() || "Olá, gostaria de mais informações sobre os imóveis.";
    const text = name ? `Olá, meu nome é ${name}. ${message}` : message;
    window.open(`https://wa.me/55${whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <section id="contato" className="contact-section section-padding bg-secondary">
      <div className="container-custom">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 bg-muted text-muted-foreground rounded-full text-sm font-medium mb-4">
            {siteConfig.contact_section.title_2}
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            {siteConfig.contact_section.title_1}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto text-sm">
            {siteConfig.contact_section.subtitle}
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-2xl border border-border p-8 md:p-10" style={{ boxShadow: 'var(--shadow-elegant)' }}>
            <form className="contact-form space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input w-full px-4 py-3 bg-secondary rounded-lg border border-border text-foreground placeholder:text-muted-foreground/60 focus:border-ring outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Mensagem
                </label>
                <textarea
                  rows={4}
                  placeholder="Como podemos ajudar?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="input w-full px-4 py-3 bg-secondary rounded-lg border border-border text-foreground placeholder:text-muted-foreground/60 focus:border-ring outline-none transition-all resize-none text-sm"
                />
              </div>

              <Button type="submit" className="w-full py-6 text-base rounded-lg flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                Enviar pelo WhatsApp
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href={whatsappUrl(siteConfig.contact.celular)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
                <Phone className="w-4 h-4" />
                {siteConfig.contact.phone}
              </a>
              <a href={whatsappUrl(siteConfig.contact.celular, "Olá, gostaria de mais informações.")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
                <Mail className="w-4 h-4" />
                {siteConfig.contact.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
