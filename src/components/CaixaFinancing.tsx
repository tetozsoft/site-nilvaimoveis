"use client";

import { BadgeCheck, Calculator, FileCheck2, MessageCircle, ShieldCheck } from "lucide-react";
import { useSiteConfigContext } from "@/contexts/SiteConfigContext";
import { whatsappUrl } from "@/lib/utils";

const CAIXA_WHATSAPP_MESSAGE =
  "Olá, quero simular financiamento habitacional pela CAIXA com a Nilva Imóveis.";

const CaixaFinancing = () => {
  const siteConfig = useSiteConfigContext();

  return (
    <section id="financiamento-caixa" className="caixa-financing">
      <div className="container-custom">
        <div className="caixa-financing__panel">
          <div className="caixa-financing__content">
            <span className="caixa-financing__eyebrow">
              <BadgeCheck className="h-4 w-4" />
              Correspondente CAIXA Aqui
            </span>
            <h2>Financie seu imóvel pela CAIXA com a Nilva</h2>
            <p>
              Acompanhamos sua simulação, documentação e encaminhamento da proposta
              de financiamento habitacional.
            </p>

            <div className="caixa-financing__steps" aria-label="Etapas do financiamento">
              <span>
                <Calculator className="h-4 w-4" />
                Simulação
              </span>
              <span>
                <FileCheck2 className="h-4 w-4" />
                Documentação
              </span>
              <span>
                <ShieldCheck className="h-4 w-4" />
                Encaminhamento CAIXA
              </span>
            </div>
          </div>

          <div className="caixa-financing__action">
            <a
              href={whatsappUrl(siteConfig.contact.celular, CAIXA_WHATSAPP_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="caixa-financing__button"
            >
              <MessageCircle className="h-5 w-5" />
              Quero simular meu financiamento
            </a>
            <p>Sujeito às regras, análise de crédito e contratação da CAIXA.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaixaFinancing;
