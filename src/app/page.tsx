import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchConfigServer } from "@/lib/cdn";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedProperties from "@/components/FeaturedProperties";
import About from "@/components/About";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const config = await fetchConfigServer().catch(() => null);

  const title = config?.seo?.title || config?.site_name || "Imobiliária";
  const description = config?.seo?.description || "Encontre o imóvel dos seus sonhos";

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      url: "/",
    },
  };
}

export default async function HomePage() {
  const config = await fetchConfigServer().catch(() => null);

  // JSON-LD is built from trusted CDN config data (same origin, not user input)
  const organizationJsonLd = config
    ? {
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        name: config.company_name,
        url: config.contact.website,
        ...(config.logo_url && { logo: config.logo_url }),
        telephone: config.contact.phone || config.contact.celular,
        email: config.contact.email,
        ...(config.contact.address && {
          address: {
            "@type": "PostalAddress",
            streetAddress: config.contact.address,
          },
        }),
        sameAs: [
          config.social_links?.instagram,
          config.social_links?.facebook,
          config.social_links?.linkedin,
          config.social_links?.youtube,
          config.social_links?.tiktok,
        ].filter(Boolean),
      }
    : null;

  return (
    <>
      {organizationJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      )}
      <Suspense>
        <div className="min-h-screen">
          <Header />
          <Hero />
          <FeaturedProperties />
          <About />
          <Services />
          <Testimonials />
          <Contact />
          <Footer />
        </div>
      </Suspense>
    </>
  );
}
