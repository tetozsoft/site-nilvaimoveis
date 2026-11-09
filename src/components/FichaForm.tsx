"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Pencil,
  Send,
  ShieldCheck,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSiteConfigContext } from "@/contexts/SiteConfigContext";
import { whatsappUrl } from "@/lib/utils";
import {
  EMPTY_FICHA,
  FICHA_COPY,
  ESTADOS_CIVIS,
  REGIMES_DE_BENS,
  TIPOS_DE_CONTA,
  UFS,
  buildWhatsAppMessage,
  findFirstInvalidStep,
  getSteps,
  hasPartner,
  isValidCep,
  maskCep,
  maskCpf,
  maskCpfOrCnpj,
  maskDate,
  maskPhone,
  validateStep,
  type FichaData,
  type FichaErrors,
  type FichaKind,
  type PaymentMethod,
  type StepId,
} from "@/lib/ficha";

function stepLabels(kind: FichaKind): Record<StepId, string> {
  const copy = FICHA_COPY[kind];
  return {
    vendedor: copy.partyStepLabel,
    conjuge: "Cônjuge",
    recebimento: copy.paymentStepLabel,
    revisao: "Revisão",
  };
}

function stepTitles(kind: FichaKind): Record<StepId, { title: string; hint: string }> {
  const copy = FICHA_COPY[kind];
  return {
    vendedor: { title: copy.partyTitle, hint: copy.partyHint },
    conjuge: {
      title: "Dados do cônjuge ou companheiro(a)",
      hint: "Como o estado civil é casado(a) ou união estável, o contrato também leva os dados dele(a).",
    },
    recebimento: { title: copy.paymentTitle, hint: copy.paymentHint },
    revisao: {
      title: "Confira e envie",
      hint: "Veja se está tudo certo. Depois é só enviar pelo WhatsApp.",
    },
  };
}

type MaskFn = (value: string) => string;
type Span = "full" | "half" | "third" | "two-thirds" | "five" | "two";

interface TextOptions {
  label: string;
  optional?: boolean;
  hint?: string;
  mask?: MaskFn;
  inputMode?: "text" | "numeric" | "tel" | "email";
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
  span?: Span;
  type?: "text" | "email";
}

/** Mostra a mensagem com o negrito e o itálico que o WhatsApp vai aplicar. */
function renderWhatsAppPreview(message: string) {
  return message.split(/(\*[^*\n]+\*|_[^_\n]+_)/g).map((part, index) => {
    if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) {
      return <strong key={index}>{part.slice(1, -1)}</strong>;
    }
    if (part.length > 2 && part.startsWith("_") && part.endsWith("_")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export function FichaForm({ kind }: { kind: FichaKind }) {
  const siteConfig = useSiteConfigContext();
  const copy = FICHA_COPY[kind];
  const STEP_LABELS = useMemo(() => stepLabels(kind), [kind]);
  const STEP_TITLES = useMemo(() => stepTitles(kind), [kind]);
  const DRAFT_KEY = copy.draftKey;
  const [data, setData] = useState<FichaData>(EMPTY_FICHA);
  const [errors, setErrors] = useState<FichaErrors>({});
  const [step, setStep] = useState<StepId>("vendedor");
  const [cepLoading, setCepLoading] = useState(false);
  const [sentLink, setSentLink] = useState<string | null>(null);
  const [sentText, setSentText] = useState("");
  const [copied, setCopied] = useState(false);
  const [draftReady, setDraftReady] = useState(false);

  const topRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lastCep = useRef("");

  const steps = useMemo(() => getSteps(data), [data]);
  const stepIndex = Math.max(0, steps.indexOf(step));

  // ── Rascunho: fica só nesta aba do navegador e some quando a aba fecha ──
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<FichaData>;
        setData({ ...EMPTY_FICHA, ...saved, declaracao: false });
      }
    } catch {
      // Sem rascunho: segue com a ficha vazia.
    }
    setDraftReady(true);
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...data, declaracao: false }));
    } catch {
      // Navegador bloqueou o armazenamento: o preenchimento continua normal.
    }
  }, [data, draftReady]);

  // ── Edição de campos ──
  const setField = useCallback(<K extends keyof FichaData>(key: K, value: FichaData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const validateField = useCallback(
    (key: keyof FichaData) => {
      const found = validateStep(step, data, kind)[key];
      setErrors((prev) => {
        const next = { ...prev };
        if (found) next[key] = found;
        else delete next[key];
        return next;
      });
    },
    [step, data, kind],
  );

  // ── Preenchimento automático pelo CEP ──
  useEffect(() => {
    const cep = data.cep;
    if (!isValidCep(cep) || lastCep.current === cep) return;
    lastCep.current = cep;

    const controller = new AbortController();
    setCepLoading(true);
    fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, "")}/json/`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((info) => {
        if (!info || info.erro) return;
        setData((prev) => ({
          ...prev,
          logradouro: prev.logradouro || info.logradouro || "",
          bairro: prev.bairro || info.bairro || "",
          cidade: prev.cidade || info.localidade || "",
          uf: info.uf && UFS.includes(info.uf) ? info.uf : prev.uf,
        }));
        // O endereço preenchido não pode manter o erro de "campo vazio" de antes.
        setErrors((prev) => {
          const next = { ...prev };
          for (const key of ["logradouro", "bairro", "cidade", "uf"] as const) delete next[key];
          return next;
        });
      })
      .catch(() => {
        // Sem internet para o CEP: a pessoa preenche o endereço à mão.
      })
      .finally(() => setCepLoading(false));

    return () => controller.abort();
  }, [data.cep]);

  // ── Navegação entre etapas ──
  const goTo = useCallback((target: StepId) => {
    setStep(target);
    requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      headingRef.current?.focus({ preventScroll: true });
    });
  }, []);

  const focusFirstError = useCallback((found: FichaErrors) => {
    const firstKey = Object.keys(found)[0];
    if (!firstKey) return;
    requestAnimationFrame(() => {
      const el = document.getElementById(`ficha-${firstKey}`) ?? document.querySelector(`[data-field="${firstKey}"]`);
      if (el instanceof HTMLElement) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus({ preventScroll: true });
      }
    });
  }, []);

  const handleNext = () => {
    const found = validateStep(step, data, kind);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirstError(found);
      return;
    }
    goTo(steps[stepIndex + 1]);
  };

  const handleBack = () => {
    setErrors({});
    goTo(steps[Math.max(0, stepIndex - 1)]);
  };

  const handleSend = () => {
    const invalid = findFirstInvalidStep(data, kind);
    if (invalid) {
      const found = validateStep(invalid, data, kind);
      setErrors(found);
      goTo(invalid);
      focusFirstError(found);
      return;
    }
    const found = validateStep("revisao", data, kind);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirstError(found);
      return;
    }

    const text = buildWhatsAppMessage(data, new Date(), kind);
    const link = whatsappUrl(siteConfig.contact.celular, text);
    setSentText(text);
    setSentLink(link);
    try {
      window.sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      // Sem armazenamento: nada a limpar.
    }
    window.open(link, "_blank", "noopener,noreferrer");
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sentText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handleRestart = () => {
    lastCep.current = "";
    setData(EMPTY_FICHA);
    setErrors({});
    setSentLink(null);
    setSentText("");
    setStep("vendedor");
  };

  const toggleMethod = (method: PaymentMethod) => {
    const has = data.metodos.includes(method);
    setField("metodos", has ? data.metodos.filter((m) => m !== method) : [...data.metodos, method]);
  };

  // ── Peças de formulário ──
  const fieldProps = (key: keyof FichaData, error?: string) => ({
    id: `ficha-${key}`,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `ficha-${key}-error` : undefined,
  });

  const renderError = (key: keyof FichaData) =>
    errors[key] ? (
      <p className="ficha-field__error" id={`ficha-${key}-error`} role="alert">
        <AlertCircle aria-hidden="true" />
        {errors[key]}
      </p>
    ) : null;

  const text = (key: keyof FichaData, options: TextOptions) => {
    const value = String(data[key] ?? "");
    const error = errors[key];
    const span = options.span ?? "full";
    return (
      <div className={`ficha-field ficha-field--${span}${error ? " ficha-field--invalid" : ""}`}>
        <label className="ficha-field__label" htmlFor={`ficha-${key}`}>
          {options.label}
          {options.optional && <span className="ficha-field__optional"> (opcional)</span>}
        </label>
        <input
          {...fieldProps(key, error)}
          className="ficha-field__control"
          type={options.type ?? "text"}
          value={value}
          inputMode={options.inputMode}
          autoComplete={options.autoComplete ?? "off"}
          placeholder={options.placeholder}
          maxLength={options.maxLength}
          onChange={(e) => {
            const next = options.mask ? options.mask(e.target.value) : e.target.value;
            setField(key, next as FichaData[typeof key]);
          }}
          onBlur={() => {
            if (value || !options.optional) validateField(key);
          }}
        />
        {options.hint && !error && <p className="ficha-field__hint">{options.hint}</p>}
        {renderError(key)}
      </div>
    );
  };

  const select = (
    key: keyof FichaData,
    label: string,
    choices: string[],
    options: { span?: Span; placeholder?: string; autoComplete?: string } = {},
  ) => {
    const error = errors[key];
    return (
      <div className={`ficha-field ficha-field--${options.span ?? "full"}${error ? " ficha-field--invalid" : ""}`}>
        <label className="ficha-field__label" htmlFor={`ficha-${key}`}>
          {label}
        </label>
        <select
          {...fieldProps(key, error)}
          className="ficha-field__control ficha-field__control--select"
          value={String(data[key] ?? "")}
          autoComplete={options.autoComplete ?? "off"}
          onChange={(e) => setField(key, e.target.value as FichaData[typeof key])}
          onBlur={() => validateField(key)}
        >
          {options.placeholder && <option value="">{options.placeholder}</option>}
          {choices.map((choice) => (
            <option key={choice} value={choice}>
              {choice}
            </option>
          ))}
        </select>
        {renderError(key)}
      </div>
    );
  };

  // ── Etapas ──
  const renderVendedor = () => (
    <>
      <fieldset className="ficha-group">
        <legend className="ficha-group__title">Dados pessoais</legend>
        <div className="ficha-grid">
          {text("nome", { label: "Nome completo", autoComplete: "name", placeholder: "Como está no documento" })}
          {text("cpf", { label: "CPF", mask: maskCpf, inputMode: "numeric", placeholder: "000.000.000-00", span: "half" })}
          {text("nascimento", {
            label: "Data de nascimento",
            mask: maskDate,
            inputMode: "numeric",
            placeholder: "dd/mm/aaaa",
            autoComplete: "bday",
            span: "half",
          })}
          {text("documento", {
            label: "RG ou CNH (número)",
            placeholder: "Número do documento",
            span: "half",
          })}
          {text("orgaoExpedidor", {
            label: "Órgão expedidor",
            placeholder: "Ex.: SSP-SP",
            span: "half",
          })}
          {text("nacionalidade", { label: "Nacionalidade", span: "half" })}
          {text("profissao", { label: "Profissão", autoComplete: "organization-title", span: "half" })}
          {select("estadoCivil", "Estado civil", ESTADOS_CIVIS, {
            placeholder: "Selecione",
            span: hasPartner(data.estadoCivil) ? "half" : "full",
          })}
          {hasPartner(data.estadoCivil) &&
            select("regimeBens", "Regime de bens", REGIMES_DE_BENS, { placeholder: "Selecione", span: "half" })}
        </div>
      </fieldset>

      <fieldset className="ficha-group">
        <legend className="ficha-group__title">Endereço</legend>
        <div className="ficha-grid">
          {text("cep", {
            label: "CEP",
            mask: maskCep,
            inputMode: "numeric",
            autoComplete: "postal-code",
            placeholder: "00000-000",
            hint: cepLoading ? "Buscando endereço…" : "Preenchemos o endereço para você.",
            span: "third",
          })}
          {text("logradouro", { label: "Rua ou avenida", autoComplete: "address-line1", span: "two-thirds" })}
          {text("numero", { label: "Número", inputMode: "numeric", span: "third" })}
          {text("complemento", { label: "Complemento", optional: true, placeholder: "Apto, bloco, casa…", span: "two-thirds" })}
          {text("bairro", { label: "Bairro", span: "five" })}
          {text("cidade", { label: "Cidade", autoComplete: "address-level2", span: "five" })}
          {select("uf", "UF", UFS, { span: "two", autoComplete: "address-level1" })}
        </div>
      </fieldset>

      <fieldset className="ficha-group">
        <legend className="ficha-group__title">Contato</legend>
        <div className="ficha-grid">
          {text("telefone", {
            label: "Telefone / WhatsApp",
            mask: maskPhone,
            inputMode: "tel",
            autoComplete: "tel-national",
            placeholder: "(00) 00000-0000",
            span: "half",
          })}
          {text("email", {
            label: "E-mail",
            optional: true,
            type: "email",
            inputMode: "email",
            autoComplete: "email",
            placeholder: "voce@email.com",
            span: "half",
          })}
        </div>
      </fieldset>
    </>
  );

  const renderConjuge = () => (
    <fieldset className="ficha-group">
      <legend className="ficha-group__title">Cônjuge ou companheiro(a)</legend>
      <div className="ficha-grid">
        {text("conjugeNome", { label: "Nome completo", placeholder: "Como está no documento" })}
        {text("conjugeCpf", { label: "CPF", mask: maskCpf, inputMode: "numeric", placeholder: "000.000.000-00", span: "half" })}
        {text("conjugeNascimento", {
          label: "Data de nascimento",
          mask: maskDate,
          inputMode: "numeric",
          placeholder: "dd/mm/aaaa",
          span: "half",
        })}
        {text("conjugeDocumento", { label: "RG ou CNH (número)", placeholder: "Número do documento", span: "half" })}
        {text("conjugeOrgaoExpedidor", { label: "Órgão expedidor", placeholder: "Ex.: SSP-SP", span: "half" })}
        {text("conjugeNacionalidade", { label: "Nacionalidade", span: "half" })}
        {text("conjugeProfissao", { label: "Profissão", span: "half" })}
        {text("conjugeTelefone", {
          label: "Telefone / WhatsApp",
          mask: maskPhone,
          inputMode: "tel",
          placeholder: "(00) 00000-0000",
          span: "half",
        })}
        {text("conjugeEmail", {
          label: "E-mail",
          optional: true,
          type: "email",
          inputMode: "email",
          placeholder: "nome@email.com",
          span: "half",
        })}
        {text("conjugeEndereco", {
          label: "Endereço, se for diferente do seu",
          optional: true,
          placeholder: "Rua, número, bairro, cidade",
        })}
      </div>
    </fieldset>
  );

  const renderRecebimento = () => (
    <>
      <fieldset className="ficha-group">
        <legend className="ficha-group__title">{copy.paymentGroup}</legend>
        <div className="ficha-chips" data-field="metodos" id="ficha-metodos" tabIndex={-1}>
          {(
            [
              ["pix", "Pix"],
              ["transferencia", "Transferência bancária"],
            ] as [PaymentMethod, string][]
          ).map(([method, label]) => {
            const active = data.metodos.includes(method);
            return (
              <button
                key={method}
                type="button"
                className={`ficha-chip${active ? " ficha-chip--active" : ""}`}
                aria-pressed={active}
                onClick={() => toggleMethod(method)}
              >
                <span className="ficha-chip__mark" aria-hidden="true">
                  {active && <Check />}
                </span>
                {label}
              </button>
            );
          })}
        </div>
        {renderError("metodos")}
      </fieldset>

      <fieldset className="ficha-group">
        <legend className="ficha-group__title">Titular</legend>
        <div className="ficha-grid">
          {text("titular", {
            label: "Titular da chave Pix ou da conta",
            placeholder: "Nome de quem recebe",
            hint: copy.holderHint,
          })}
          {text("titularDocumento", {
            label: "CPF ou CNPJ do titular",
            mask: maskCpfOrCnpj,
            inputMode: "numeric",
            placeholder: "Somente números",
          })}
        </div>
      </fieldset>

      {data.metodos.includes("pix") && (
        <fieldset className="ficha-group">
          <legend className="ficha-group__title">Pix</legend>
          <div className="ficha-grid">
            {text("chavePix", {
              label: "Chave Pix",
              placeholder: "CPF, e-mail, celular ou chave aleatória",
            })}
          </div>
        </fieldset>
      )}

      {data.metodos.includes("transferencia") && (
        <fieldset className="ficha-group">
          <legend className="ficha-group__title">Conta bancária</legend>
          <div className="ficha-grid">
            {text("banco", { label: "Banco", placeholder: "Ex.: Caixa, Itaú, Nubank", span: "third" })}
            {text("agencia", { label: "Agência", inputMode: "numeric", placeholder: "0000", span: "third" })}
            {text("conta", { label: "Conta (com dígito)", placeholder: "00000-0", span: "third" })}
            <div className="ficha-field ficha-field--full">
              <span className="ficha-field__label" id="ficha-tipoConta-label">
                Tipo de conta
              </span>
              <div className="ficha-segmented" role="radiogroup" aria-labelledby="ficha-tipoConta-label">
                {TIPOS_DE_CONTA.map((tipo) => (
                  <label
                    key={tipo}
                    className={`ficha-segmented__option${data.tipoConta === tipo ? " ficha-segmented__option--active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="tipoConta"
                      value={tipo}
                      checked={data.tipoConta === tipo}
                      onChange={() => setField("tipoConta", tipo)}
                    />
                    {tipo}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </fieldset>
      )}
    </>
  );

  const reviewRows = (rows: [string, string][]) =>
    rows
      .filter(([, value]) => value && value.trim())
      .map(([label, value]) => (
        <div className="ficha-review__row" key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ));

  const renderRevisao = () => {
    const endereco = [
      [data.logradouro, data.numero].filter(Boolean).join(", "),
      data.complemento,
      data.bairro,
      [data.cidade, data.uf].filter(Boolean).join("/"),
      data.cep,
    ]
      .filter(Boolean)
      .join(" · ");

    const preview = buildWhatsAppMessage(data, new Date(), kind);

    return (
      <>
        <section className="ficha-review" aria-labelledby="rev-vendedor">
          <header className="ficha-review__head">
            <h3 id="rev-vendedor">{copy.partyReview}</h3>
            <button type="button" className="ficha-link" onClick={() => goTo("vendedor")}>
              <Pencil aria-hidden="true" /> Editar
            </button>
          </header>
          <dl>
            {reviewRows([
              ["Nome", data.nome],
              ["CPF", data.cpf],
              ["Documento", [data.documento, data.orgaoExpedidor].filter(Boolean).join(" / ")],
              ["Nascimento", data.nascimento],
              ["Nacionalidade", data.nacionalidade],
              ["Profissão", data.profissao],
              ["Estado civil", [data.estadoCivil, hasPartner(data.estadoCivil) ? data.regimeBens : ""].filter(Boolean).join(" · ")],
              ["Endereço", endereco],
              ["Telefone", data.telefone],
              ["E-mail", data.email],
            ])}
          </dl>
        </section>

        {hasPartner(data.estadoCivil) && (
          <section className="ficha-review" aria-labelledby="rev-conjuge">
            <header className="ficha-review__head">
              <h3 id="rev-conjuge">Cônjuge ou companheiro(a)</h3>
              <button type="button" className="ficha-link" onClick={() => goTo("conjuge")}>
                <Pencil aria-hidden="true" /> Editar
              </button>
            </header>
            <dl>
              {reviewRows([
                ["Nome", data.conjugeNome],
                ["CPF", data.conjugeCpf],
                ["Documento", [data.conjugeDocumento, data.conjugeOrgaoExpedidor].filter(Boolean).join(" / ")],
                ["Nascimento", data.conjugeNascimento],
                ["Nacionalidade", data.conjugeNacionalidade],
                ["Profissão", data.conjugeProfissao],
                ["Telefone", data.conjugeTelefone],
                ["E-mail", data.conjugeEmail],
                ["Endereço", data.conjugeEndereco],
              ])}
            </dl>
          </section>
        )}

        <section className="ficha-review" aria-labelledby="rev-recebimento">
          <header className="ficha-review__head">
            <h3 id="rev-recebimento">{copy.paymentStepLabel}</h3>
            <button type="button" className="ficha-link" onClick={() => goTo("recebimento")}>
              <Pencil aria-hidden="true" /> Editar
            </button>
          </header>
          <dl>
            {reviewRows([
              ["Chave Pix", data.metodos.includes("pix") ? data.chavePix : ""],
              ["Titular", data.titular],
              ["CPF / CNPJ", data.titularDocumento],
              ["Banco", data.metodos.includes("transferencia") ? data.banco : ""],
              [
                "Agência / conta",
                data.metodos.includes("transferencia")
                  ? [data.agencia, data.conta].filter(Boolean).join(" / ")
                  : "",
              ],
              ["Tipo de conta", data.metodos.includes("transferencia") ? data.tipoConta : ""],
            ])}
          </dl>
        </section>

        <details className="ficha-preview">
          <summary>Ver o texto que vai para o WhatsApp</summary>
          <div className="ficha-preview__text">{renderWhatsAppPreview(preview)}</div>
        </details>

        <div className={`ficha-declaration${errors.declaracao ? " ficha-declaration--invalid" : ""}`}>
          <label className="ficha-declaration__label">
            <input
              {...fieldProps("declaracao", errors.declaracao)}
              type="checkbox"
              checked={data.declaracao}
              onChange={(e) => setField("declaracao", e.target.checked)}
            />
            <span>
              <strong>Declaração de veracidade.</strong> Declaro que todas as informações desta ficha são verdadeiras
              e completas, e me responsabilizo por elas para a elaboração do contrato de compra e venda.
            </span>
          </label>
          {renderError("declaracao")}
        </div>
      </>
    );
  };

  const isLast = step === "revisao";
  const whatsappLabel = siteConfig.contact.celular;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="ficha" id="conteudo">
        <div className="container-custom ficha__inner" ref={topRef}>
          <header className="ficha__intro">
            <p className="ficha__eyebrow">{copy.eyebrow}</p>
            <h1 className="ficha__title">{copy.title}</h1>
            <p className="ficha__lead">{copy.lead(siteConfig.company_name)}</p>
            <p className="ficha__privacy">
              <ShieldCheck aria-hidden="true" />
              Este site não guarda seus dados. A ficha vai direto para o WhatsApp.
            </p>
          </header>

          {sentLink ? (
            <section className="ficha-done" aria-live="polite">
              <div className="ficha-done__icon" aria-hidden="true">
                <Check />
              </div>
              <h2 className="ficha-done__title" tabIndex={-1} ref={headingRef}>
                Falta só um toque
              </h2>
              <ol className="ficha-done__steps">
                <li>Abrimos o WhatsApp com a ficha já escrita, no número {whatsappLabel}.</li>
                <li>Toque em enviar para entregar a ficha.</li>
              </ol>
              <div className="ficha-done__actions">
                <a className="ficha-btn ficha-btn--primary" href={sentLink} target="_blank" rel="noopener noreferrer">
                  <Send aria-hidden="true" /> Abrir o WhatsApp de novo
                </a>
                <button type="button" className="ficha-btn ficha-btn--ghost" onClick={handleCopy}>
                  {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                  {copied ? "Mensagem copiada" : "Copiar a mensagem"}
                </button>
              </div>
              <p className="ficha-done__note">
                O WhatsApp não abriu? Copie a mensagem e cole numa conversa com o número {whatsappLabel}.
              </p>
              <div className="ficha-done__footer">
                <a className="ficha-link" href="/">
                  <ArrowLeft aria-hidden="true" /> Voltar ao início
                </a>
                <button type="button" className="ficha-link" onClick={handleRestart}>
                  Preencher outra ficha
                </button>
              </div>
            </section>
          ) : (
            <div className="ficha__layout">
              <nav className="ficha-steps" aria-label="Etapas da ficha">
                <p className="ficha-steps__count" aria-live="polite">
                  Etapa {stepIndex + 1} de {steps.length}
                </p>
                <ol className="ficha-steps__list">
                  {steps.map((id, index) => {
                    const state = index < stepIndex ? "done" : index === stepIndex ? "current" : "todo";
                    return (
                      <li
                        key={id}
                        className={`ficha-steps__item ficha-steps__item--${state}`}
                        aria-current={state === "current" ? "step" : undefined}
                      >
                        <span className="ficha-steps__dot" aria-hidden="true">
                          {state === "done" ? <Check /> : index + 1}
                        </span>
                        <span className="ficha-steps__label">{STEP_LABELS[id]}</span>
                      </li>
                    );
                  })}
                </ol>
              </nav>

              <form
                className="ficha-form"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isLast) handleSend();
                  else handleNext();
                }}
              >
                <header className="ficha-form__head">
                  <h2 className="ficha-form__title" tabIndex={-1} ref={headingRef}>
                    {STEP_TITLES[step].title}
                  </h2>
                  <p className="ficha-form__hint">{STEP_TITLES[step].hint}</p>
                </header>

                {step === "vendedor" && renderVendedor()}
                {step === "conjuge" && renderConjuge()}
                {step === "recebimento" && renderRecebimento()}
                {step === "revisao" && renderRevisao()}

                <div className="ficha-actions">
                  {stepIndex > 0 && (
                    <button type="button" className="ficha-btn ficha-btn--ghost" onClick={handleBack}>
                      <ChevronLeft aria-hidden="true" /> Voltar
                    </button>
                  )}
                  <button type="submit" className="ficha-btn ficha-btn--primary ficha-actions__next">
                    {isLast ? (
                      <>
                        <Send aria-hidden="true" /> Enviar pelo WhatsApp
                      </>
                    ) : (
                      <>
                        Continuar <ChevronRight aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
                {cepLoading && (
                  <p className="sr-only" role="status">
                    Buscando endereço pelo CEP
                  </p>
                )}
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
