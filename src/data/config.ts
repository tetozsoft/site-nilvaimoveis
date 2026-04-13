// ── CDN API-aligned site config ──

export interface SiteConfig {
  company_id: string;
  company_name: string;
  site_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  font_color?: string;
  heading_color?: string;
  footer_bg_color?: string;
  contact: {
    email: string;
    phone: string;
    celular: string;
    website: string;
    address: string;
  };
  creci: string;
  creci_estado: string;
  social_links: {
    instagram: string | null;
    facebook: string | null;
    linkedin: string | null;
    youtube: string | null;
    tiktok: string | null;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
  banner: {
    bg_url: string;
    title: string;
    subtitle: string;
    show_stats: boolean;
  };
  listing: {
    title: string;
    subtitle: string;
  };
  about: {
    image_url: string;
    title: string;
    title_highlight: string;
    subtitle: string;
    description: string;
    stats: {
      sold_properties: number;
      satisfied_clients: number;
      years_market: number;
      neighborhoods: number;
    };
  };
  services: {
    title: string;
    title_highlight: string;
    subtitle: string;
    cards: Array<{ title: string; description: string }>;
  };
  testimonials: {
    title: string;
    title_highlight: string;
    subtitle: string;
    items: Array<{
      name: string;
      role: string;
      photo_url: string;
      text: string;
    }>;
  };
  contact_section: {
    title_1: string;
    title_2: string;
    subtitle: string;
  };
  generated_at: string;
}
