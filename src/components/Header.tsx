"use client";

import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useSiteConfigContext } from "@/contexts/SiteConfigContext";
import { whatsappUrl } from "@/lib/utils";

const Header = () => {
  const siteConfig = useSiteConfigContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { label: "Início", href: "#inicio" },
    { label: "Imóveis", href: "#imoveis" },
    { label: "Sobre", href: "#sobre" },
    { label: "Serviços", href: "#servicos" },
    { label: "Contato", href: "#contato" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    if (pathname !== "/") {
      router.push("/" + href);
    } else {
      const el = document.querySelector(href);
      if (href === "#inicio") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const waUrl = whatsappUrl(siteConfig.contact.celular);
  const waVisitUrl = whatsappUrl(siteConfig.contact.celular, "Olá, gostaria de agendar uma visita.");

  return (
    <header className="site-header fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href="#inicio"
            onClick={(e) => handleNavClick(e, "#inicio")}
            className="flex items-center gap-2"
          >
            {siteConfig.logo_url ? (
              <img src={siteConfig.logo_url} alt={siteConfig.company_name} className="h-10 w-auto object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-xl">
                  {siteConfig.company_name.charAt(0)}
                </span>
              </div>
            )}
            <span className="font-display text-xl font-semibold text-foreground">
              {siteConfig.company_name.split(" ")[0]}<span className="text-accent">{siteConfig.company_name.split(" ").slice(1).join(" ")}</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="site-nav hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="site-nav__link text-muted-foreground hover:text-foreground transition-colors duration-300 text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Phone className="w-4 h-4" />
              {siteConfig.contact.celular}
            </a>
            <a href={waVisitUrl} target="_blank" rel="noopener noreferrer">
              <Button className="btn-accent rounded-full px-6">
                Agendar Visita
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="mobile-nav md:hidden py-6 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-foreground hover:text-accent transition-colors duration-300 text-lg font-medium py-2"
                >
                  {link.label}
                </a>
              ))}
              <a href={waVisitUrl} target="_blank" rel="noopener noreferrer">
                <Button className="btn-accent rounded-full mt-4 w-full">
                  Agendar Visita
                </Button>
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
