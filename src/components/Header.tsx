"use client";

import { useState } from "react";
import { Heart, Home, Instagram, MapPin, Menu, MessageCircle, Phone, Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSiteConfigContext } from "@/contexts/SiteConfigContext";
import { socialUrl, whatsappUrl } from "@/lib/utils";

const Header = () => {
  const siteConfig = useSiteConfigContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQuickOpen, setIsQuickOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { label: "Início", href: "#inicio" },
    { label: "Sobre", href: "#sobre" },
    { label: "Vendas", href: "#imoveis" },
    { label: "Serviços", href: "#servicos" },
    { label: "Contato", href: "#contato" },
  ];

  const quickLinks = [
    { label: "Todos os Imóveis", href: "/imoveis" },
    { label: "Comprar", href: "/imoveis?transacao=venda" },
    { label: "Alugar", href: "/imoveis?transacao=aluguel" },
    { label: "Destaques", href: "/#imoveis" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    setIsQuickOpen(false);

    if (href.startsWith("/")) {
      router.push(href);
      return;
    }

    if (pathname !== "/") {
      router.push("/" + href);
      return;
    }

    const el = document.querySelector(href);
    if (href === "#inicio") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const waUrl = whatsappUrl(siteConfig.contact.celular);
  const waVisitUrl = whatsappUrl(siteConfig.contact.celular, "Olá, gostaria de agendar uma visita.");
  const creci = [siteConfig.creci, siteConfig.creci_estado].filter(Boolean).join("/");
  const locationLabel = siteConfig.contact.address || siteConfig.creci_estado || siteConfig.site_name;
  const instagram = siteConfig.social_links.instagram;

  return (
    <header className="site-header sticky top-0 z-50">
      <div className="site-header__top">
        <div className="container-custom site-header__top-inner">
          <p className="site-header__meta">
            {creci && <span>CRECI {creci}</span>}
            <span className="site-header__location">
              <MapPin className="h-3.5 w-3.5" />
              {locationLabel}
            </span>
          </p>

          <div className="site-header__actions">
            {siteConfig.contact.celular && (
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="site-header__phone">
                <Phone className="h-3.5 w-3.5" />
                {siteConfig.contact.celular}
              </a>
            )}
            {siteConfig.contact.celular && (
              <a href={waVisitUrl} target="_blank" rel="noopener noreferrer" className="site-header__whatsapp">
                <MessageCircle className="h-3.5 w-3.5" />
                Atendimento via WhatsApp
              </a>
            )}

            <div className="site-header__quick">
              <button
                type="button"
                id="findfast"
                className="site-header__quick-trigger"
                onClick={() => setIsQuickOpen((open) => !open)}
              >
                encontre rápido
              </button>
              {isQuickOpen && (
                <div className="site-header__quick-menu">
                  {quickLinks.map((link) => (
                    <a key={link.label} href={link.href} onClick={(e) => handleNavClick(e, link.href)}>
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {instagram && (
              <a
                href={socialUrl("instagram", instagram)}
                target="_blank"
                rel="noopener noreferrer"
                className="site-header__social"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="site-header__main">
        <div className="container-custom site-header__main-inner">
          <a href="#inicio" onClick={(e) => handleNavClick(e, "#inicio")} className="site-header__brand">
            {siteConfig.logo_url ? (
              <img src={siteConfig.logo_url} alt={siteConfig.company_name} className="site-header__logo" />
            ) : (
              <span className="site-header__fallback-logo">{siteConfig.company_name.charAt(0)}</span>
            )}
            <span className="site-header__brand-name">{siteConfig.company_name}</span>
          </a>

          <nav className="site-nav" aria-label="Navegação principal">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className="site-nav__link">
                {link.href === "#inicio" && <Home className="h-4 w-4" />}
                <span>{link.label}</span>
              </a>
            ))}
            <a href="/imoveis" onClick={(e) => handleNavClick(e, "/imoveis")} className="site-nav__icon-link" aria-label="Buscar imóveis">
              <Search className="h-4 w-4" />
            </a>
            <span className="site-nav__icon-link site-nav__icon-link--muted" aria-hidden="true">
              <Heart className="h-4 w-4" />
            </span>
          </nav>

          <button
            className="site-header__menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Abrir menu"
            type="button"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <nav className="mobile-nav animate-fade-in">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} onClick={(e) => handleNavClick(e, link.href)}>
                {link.label}
              </a>
            ))}
            <a href="/imoveis" onClick={(e) => handleNavClick(e, "/imoveis")}>
              Buscar Imóveis
            </a>
            {siteConfig.contact.celular && (
              <a href={waVisitUrl} target="_blank" rel="noopener noreferrer">
                Atendimento via WhatsApp
              </a>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
