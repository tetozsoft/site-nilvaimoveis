"use client";

import { useState } from "react";
import Link from "next/link";
import { Bed, Bath, Car, Maximize, MapPin, ChevronLeft, ChevronRight, Phone, Mail, Share2, Heart, Check, Home, Building, Layers, Calendar, DollarSign, Handshake, Sofa, ArrowLeftRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePropertyDetail } from "@/hooks/use-cdn";
import { useSiteConfigContext } from "@/contexts/SiteConfigContext";
import { formatCurrency, transactionTypeLabel, whatsappUrl } from "@/lib/utils";

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) => (
  <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
    <Icon className="w-4 h-4 text-accent flex-shrink-0" />
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  </div>
);

const PriceCard = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center gap-4 p-5 bg-accent/5 border-l-4 border-accent rounded-xl">
    <DollarSign className="w-6 h-6 text-accent flex-shrink-0" />
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-accent">{value}</p>
    </div>
  </div>
);

const ConditionBadge = ({ label, active }: { label: string; active: boolean }) => (
  <div className={`rounded-xl p-4 text-center ${active ? "bg-accent/10" : "bg-secondary"}`}>
    <Check className={`w-5 h-5 mx-auto mb-1 ${active ? "text-accent" : "text-muted-foreground/30"}`} />
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className={`text-sm font-semibold ${active ? "text-accent" : "text-muted-foreground"}`}>{active ? "Sim" : "Não"}</p>
  </div>
);

export function PropertyDetailsClient({ slug }: { slug: string }) {
  const siteConfig = useSiteConfigContext();
  const { data: property, isPending, isFetching } = usePropertyDetail(slug);
  const [currentImage, setCurrentImage] = useState(0);
  const [formData, setFormData] = useState({ name: "", message: "" });

  const whatsappNumber = siteConfig.contact.celular.replace(/\D/g, "");

  if (!property && (isPending || isFetching)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">Carregando imóvel...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">Imóvel não encontrado</h1>
            <Link href="/">
              <Button className="btn-primary rounded-full px-8">Voltar ao Início</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % property.photos.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + property.photos.length) % property.photos.length);

  const locationStr = [property.endereco.bairro, property.endereco.cidade].filter(Boolean).join(", ");

  return (
    <div className="property-detail min-h-screen">
      <Header />

      <main className="pt-20">
        {/* Breadcrumb */}
        <div className="container-custom py-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Início</Link>
            <span>/</span>
            <Link href="/#imoveis" className="hover:text-foreground transition-colors">Imóveis</Link>
            <span>/</span>
            <span className="text-foreground">{property.titulo}</span>
          </nav>
        </div>

        {/* Image Gallery */}
        <section className="container-custom mb-12">
          <div className="grid lg:grid-cols-[1fr_340px] gap-4">
            {/* Main Image */}
            <div className="property-gallery relative aspect-[16/10] rounded-xl overflow-hidden group">
              <img
                src={property.photos[currentImage]?.full}
                alt={`${property.titulo} - Foto ${currentImage + 1}`}
                className="w-full h-full object-cover transition-transform duration-700"
              />
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                aria-label="Próxima foto"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
              {property.tags.length > 0 && (
                <span className="absolute top-4 left-4 px-4 py-1.5 bg-accent text-accent-foreground text-sm font-semibold rounded-full">
                  {property.tags[0]}
                </span>
              )}
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors">
                  <Heart className="w-5 h-5 text-foreground" />
                </button>
                <button className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors">
                  <Share2 className="w-5 h-5 text-foreground" />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              {property.photos.slice(0, 4).map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`relative aspect-[16/10] lg:aspect-[16/9] rounded-xl overflow-hidden transition-all ${
                    currentImage === index ? "border-2 border-accent" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={photo.medium} alt={photo.titulo || `Miniatura ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="container-custom pb-20">
          <div className="grid lg:grid-cols-[1fr_400px] gap-12">
            {/* Left: Details */}
            <div className="property-info">
              {locationStr && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <MapPin className="w-4 h-4" />
                  {locationStr}
                </div>
              )}

              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                {property.titulo}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mb-8">
                {property.tipo && (
                  <span className="px-3 py-1 bg-accent/10 text-accent text-sm font-medium rounded-full">{property.tipo}</span>
                )}
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">{transactionTypeLabel(property.transaction_type)}</span>
                {property.tem_condominio && property.nome_condominio && (
                  <span className="px-3 py-1 bg-secondary text-muted-foreground text-sm font-medium rounded-full">{property.nome_condominio}</span>
                )}
                <span className="px-3 py-1 bg-secondary text-muted-foreground text-sm font-medium rounded-full">Cód: {property.codigo}</span>
                <span className="px-3 py-1 bg-secondary text-muted-foreground text-sm font-medium rounded-full">Ano {property.ano_construcao}</span>
              </div>

              {/* Cômodos */}
              <div className="mb-10">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5 text-accent" />
                  Cômodos
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {[
                    { icon: Bed, value: property.quartos, label: "Quartos" },
                    { icon: Bed, value: property.suites, label: "Suítes" },
                    { icon: Bath, value: property.banheiros, label: "Banheiros" },
                    { icon: Sofa, value: property.salas, label: "Salas" },
                    { icon: Car, value: property.vagas_garagem, label: "Vagas" },
                  ].map(({ icon: Icon, value, label }) => (
                    <div key={label} className="bg-secondary rounded-xl p-4 text-center">
                      <Icon className="w-5 h-5 mx-auto mb-2 text-accent" />
                      <p className="text-lg font-bold text-foreground">{value}</p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Áreas */}
              {(() => {
                const areas = [
                  { value: property.area_total, label: "Total" },
                  { value: property.area_construida, label: "Construída" },
                  { value: property.area_terreno, label: "Terreno" },
                ].filter((item) => item.value != null);
                if (areas.length === 0) return null;
                return (
                  <div className="mb-10">
                    <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Maximize className="w-5 h-5 text-accent" />
                      Áreas
                    </h2>
                    <div className={`grid grid-cols-${areas.length} gap-3`}>
                      {areas.map(({ value, label }) => (
                        <div key={label} className="bg-secondary rounded-xl p-4 text-center">
                          <p className="text-lg font-bold text-foreground">{value}m²</p>
                          <p className="text-xs text-muted-foreground">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Detalhes do Imóvel */}
              <div className="mb-10">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-accent" />
                  Detalhes do Imóvel
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <InfoItem icon={Building} label="Condomínio" value={property.tem_condominio ? "Sim" : "Não"} />
                  <InfoItem icon={Layers} label="Andares" value={String(property.andares)} />
                  {property.andar !== undefined && (
                    <InfoItem icon={Layers} label="Andar" value={`${property.andar}º`} />
                  )}
                  <InfoItem icon={Calendar} label="Ano" value={String(property.ano_construcao)} />
                </div>
              </div>

              {/* Valores */}
              <div className="mb-10">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-accent" />
                  Valores
                </h2>

                {/* Preços primários */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {property.valor_venda != null && (
                    <PriceCard label="Valor de Venda" value={formatCurrency(property.valor_venda)} />
                  )}
                  {property.valor_aluguel != null && (
                    <PriceCard label="Valor do Aluguel" value={`${formatCurrency(property.valor_aluguel)}/mês`} />
                  )}
                </div>

                {/* Valores secundários */}
                {(property.valor_condominio != null || property.valor_iptu != null) && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {property.valor_condominio != null && (
                      <InfoItem icon={DollarSign} label="Condomínio" value={`${formatCurrency(property.valor_condominio)}/mês`} />
                    )}
                    {property.valor_iptu != null && (
                      <InfoItem icon={DollarSign} label="IPTU (anual)" value={formatCurrency(property.valor_iptu)} />
                    )}
                  </div>
                )}
              </div>

              {/* Condições */}
              <div className="mb-10">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-accent" />
                  Condições
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  <ConditionBadge label="Financiamento" active={property.aceita_financiamento} />
                  <ConditionBadge label="Permuta" active={property.aceita_permuta} />
                  <div className="bg-secondary rounded-xl p-4 text-center">
                    <ArrowLeftRight className="w-5 h-5 mx-auto mb-1 text-accent" />
                    <p className="text-xs text-muted-foreground">Mobiliado</p>
                    <p className="text-sm font-semibold text-foreground">{property.mobiliado ? "Sim" : "Não"}</p>
                  </div>
                </div>
              </div>

              {/* Registro */}
              {(property.matricula_imovel || property.cartorio_registro) && (
                <div className="mb-10">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5 text-accent" />
                    Registro
                  </h2>
                  <div className="bg-secondary rounded-xl p-6 space-y-2">
                    {property.matricula_imovel && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Matrícula</span>
                        <span className="font-semibold text-foreground">{property.matricula_imovel}</span>
                      </div>
                    )}
                    {property.cartorio_registro && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Cartório</span>
                        <span className="font-semibold text-foreground">{property.cartorio_registro}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Descrição */}
              <div className="mb-10">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">Descrição</h2>
                <p className="text-muted-foreground leading-relaxed">{property.descricao}</p>
              </div>

              {/* Características agrupadas */}
              {property.features && (
                <div className="property-features bg-secondary rounded-xl p-6 space-y-8">
                  {property.features.caracteristicas.length > 0 && (
                    <div>
                      <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Home className="w-5 h-5 text-accent" />
                        Características do Imóvel
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {property.features.caracteristicas.map((f) => (
                          <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="w-4 h-4 text-accent flex-shrink-0" />
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {property.features.condominio.length > 0 && (
                    <div>
                      <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Building className="w-5 h-5 text-accent" />
                        Condomínio
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {property.features.condominio.map((f) => (
                          <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="w-4 h-4 text-accent flex-shrink-0" />
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {property.features.seguranca.length > 0 && (
                    <div>
                      <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-accent" />
                        Segurança
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {property.features.seguranca.map((f) => (
                          <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="w-4 h-4 text-accent flex-shrink-0" />
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Contact Form + Corretor */}
            <div className="lg:sticky lg:top-28 h-fit space-y-6">
              {/* Corretor Card */}
              <div className="property-agent bg-card rounded-2xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-accent" />
                  Corretor Responsável
                </h3>
                <div className="flex items-center gap-4">
                  {property.corretor.avatar_url && (
                    <img
                      src={property.corretor.avatar_url}
                      alt={property.corretor.nome}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-foreground">{property.corretor.nome}</p>
                    <p className="text-xs text-muted-foreground">CRECI: {property.corretor.creci}/{property.corretor.creci_estado}</p>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-card rounded-2xl p-8" style={{ boxShadow: "var(--shadow-card)" }}>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  Interessado neste imóvel?
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Envie uma mensagem pelo WhatsApp.
                </p>

                <form
                  className="contact-form space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const name = formData.name.trim();
                    const message = formData.message.trim() || `Olá, tenho interesse no imóvel "${property.titulo}"${locationStr ? ` - ${locationStr}` : ""}. Código: ${property.codigo}`;
                    const text = name
                      ? `Olá, meu nome é ${name}. ${message}`
                      : message;
                    const url = `https://wa.me/55${whatsappNumber}?text=${encodeURIComponent(text)}`;
                    window.open(url, "_blank");
                  }}
                >
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-secondary rounded-lg border border-border text-foreground placeholder:text-muted-foreground focus:border-ring outline-none text-sm"
                  />
                  <textarea
                    placeholder={`Olá, tenho interesse no imóvel "${property.titulo}"${locationStr ? ` - ${locationStr}` : ""}.`}
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-secondary rounded-lg border border-border text-foreground placeholder:text-muted-foreground focus:border-ring outline-none text-sm resize-none"
                  />
                  <Button type="submit" className="w-full btn-accent rounded-lg py-6 text-base gap-2">
                    <Phone className="w-5 h-5" />
                    Enviar pelo WhatsApp
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-border space-y-3">
                  <a href={whatsappUrl(siteConfig.contact.celular)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Phone className="w-4 h-4 text-accent" />
                    {siteConfig.contact.phone}
                  </a>
                  <a href={whatsappUrl(siteConfig.contact.celular, "Olá, gostaria de mais informações.")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Mail className="w-4 h-4 text-accent" />
                    {siteConfig.contact.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
