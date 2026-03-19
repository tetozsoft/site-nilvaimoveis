"use client";

import { Facebook, Instagram, Linkedin, Youtube, Music2, Phone, Mail } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSiteConfigContext } from "@/contexts/SiteConfigContext";
import { socialUrl, whatsappUrl } from "@/lib/utils";

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: Music2,
};

const Footer = () => {
  const siteConfig = useSiteConfigContext();
  const pathname = usePathname();
  const router = useRouter();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (pathname !== "/") {
      router.push("/" + href);
    } else {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const links = [
    { label: "Início", href: "#inicio" },
    { label: "Imóveis", href: "#imoveis" },
    { label: "Sobre", href: "#sobre" },
    { label: "Serviços", href: "#servicos" },
    { label: "Contato", href: "#contato" },
  ];

  const activeSocials = Object.entries(siteConfig.social_links).filter(
    ([, url]) => url != null
  ) as [string, string][];

  return (
    <footer className="site-footer bg-primary text-primary-foreground">
      <div className="container-custom py-10 px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          {/* Brand */}
          <div className="flex items-center gap-2">
            {siteConfig.logo_url ? (
              <img src={siteConfig.logo_url} alt={siteConfig.company_name} className="h-8 w-auto object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-display font-bold text-base">
                  {siteConfig.company_name.charAt(0)}
                </span>
              </div>
            )}
            <span className="font-display text-lg font-semibold">
              {siteConfig.company_name.split(" ")[0]}<span className="text-accent">{siteConfig.company_name.split(" ").slice(1).join(" ")}</span>
            </span>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-wrap justify-center gap-6">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Social */}
          <div className="flex gap-3">
            {activeSocials.map(([key, url]) => {
              const Icon = socialIcons[key];
              if (!Icon) return null;
              return (
                <a
                  key={key}
                  href={socialUrl(key, url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Divider + Bottom */}
        <div className="border-t border-primary-foreground/10 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-primary-foreground/50">
          <p>&copy; {new Date().getFullYear()} {siteConfig.company_name}. Todos os direitos reservados. CRECI: {siteConfig.creci}</p>
          <div className="flex items-center gap-4">
            <a href={whatsappUrl(siteConfig.contact.celular)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary-foreground/80 transition-colors">
              <Phone className="w-3 h-3" /> {siteConfig.contact.phone}
            </a>
            <a href={whatsappUrl(siteConfig.contact.celular)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary-foreground/80 transition-colors">
              <Mail className="w-3 h-3" /> {siteConfig.contact.email}
            </a>
          </div>
        </div>

        {/* Attribution */}
        <div className="border-t border-primary-foreground/10 mt-4 pt-4 text-center text-xs text-primary-foreground/40">
          Feito por{" "}
          <a
            href="https://tetoz.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary-foreground/70 transition-colors"
          >
            TETOZ
          </a>
          , sistemas imobiliários
        </div>
      </div>
    </footer>
  );
};

export default Footer;
