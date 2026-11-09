// Ficha de informações do vendedor: máscaras, validação e mensagem do WhatsApp.
// Sem dependências de React nem de alias de import, para rodar também em node:test.

export type PaymentMethod = "pix" | "transferencia";

export interface FichaData {
  nome: string;
  cpf: string;
  documento: string;
  orgaoExpedidor: string;
  nascimento: string;
  nacionalidade: string;
  profissao: string;
  estadoCivil: string;
  regimeBens: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  telefone: string;
  email: string;

  conjugeNome: string;
  conjugeCpf: string;
  conjugeDocumento: string;
  conjugeOrgaoExpedidor: string;
  conjugeNascimento: string;
  conjugeNacionalidade: string;
  conjugeProfissao: string;
  conjugeTelefone: string;
  conjugeEmail: string;
  conjugeEndereco: string;

  metodos: PaymentMethod[];
  chavePix: string;
  titular: string;
  titularDocumento: string;
  banco: string;
  agencia: string;
  conta: string;
  tipoConta: string;

  declaracao: boolean;
}

export const EMPTY_FICHA: FichaData = {
  nome: "",
  cpf: "",
  documento: "",
  orgaoExpedidor: "",
  nascimento: "",
  nacionalidade: "Brasileira",
  profissao: "",
  estadoCivil: "",
  regimeBens: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "SP",
  telefone: "",
  email: "",

  conjugeNome: "",
  conjugeCpf: "",
  conjugeDocumento: "",
  conjugeOrgaoExpedidor: "",
  conjugeNascimento: "",
  conjugeNacionalidade: "Brasileira",
  conjugeProfissao: "",
  conjugeTelefone: "",
  conjugeEmail: "",
  conjugeEndereco: "",

  metodos: ["pix"],
  chavePix: "",
  titular: "",
  titularDocumento: "",
  banco: "",
  agencia: "",
  conta: "",
  tipoConta: "Corrente",

  declaracao: false,
};

export const ESTADOS_CIVIS = [
  "Solteiro(a)",
  "Casado(a)",
  "União estável",
  "Divorciado(a)",
  "Separado(a)",
  "Viúvo(a)",
];

export const REGIMES_DE_BENS = [
  "Comunhão parcial de bens",
  "Comunhão universal de bens",
  "Separação total de bens",
  "Separação obrigatória de bens",
  "Participação final nos aquestos",
];

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export const TIPOS_DE_CONTA = ["Corrente", "Poupança"];

/** Estado civil que exige regime de bens e dados do cônjuge ou companheiro. */
export function hasPartner(estadoCivil: string): boolean {
  return estadoCivil === "Casado(a)" || estadoCivil === "União estável";
}

// ── Máscaras ──

const digits = (value: string) => value.replace(/\D/g, "");

export function maskCpf(value: string): string {
  const d = digits(value).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

export function maskCnpj(value: string): string {
  const d = digits(value).slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
}

/** CPF até 11 dígitos, CNPJ acima disso. */
export function maskCpfOrCnpj(value: string): string {
  return digits(value).length > 11 ? maskCnpj(value) : maskCpf(value);
}

export function maskPhone(value: string): string {
  const d = digits(value).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function maskCep(value: string): string {
  const d = digits(value).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function maskDate(value: string): string {
  const d = digits(value).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

// ── Validação ──

export function isValidCpf(value: string): boolean {
  const d = digits(value);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  for (const length of [9, 10]) {
    let sum = 0;
    for (let i = 0; i < length; i++) sum += Number(d[i]) * (length + 1 - i);
    const check = ((sum * 10) % 11) % 10;
    if (check !== Number(d[length])) return false;
  }
  return true;
}

export function isValidCnpj(value: string): boolean {
  const d = digits(value);
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  for (const length of [12, 13]) {
    const weights = length === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < length; i++) sum += Number(d[i]) * weights[i];
    const rest = sum % 11;
    const check = rest < 2 ? 0 : 11 - rest;
    if (check !== Number(d[length])) return false;
  }
  return true;
}

export function isValidCpfOrCnpj(value: string): boolean {
  return digits(value).length > 11 ? isValidCnpj(value) : isValidCpf(value);
}

export function isValidDate(value: string, today = new Date()): boolean {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return false;
  const [day, month, year] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  const real = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return real && year >= 1900 && date.getTime() <= today.getTime();
}

export function isValidPhone(value: string): boolean {
  const d = digits(value);
  return d.length === 10 || d.length === 11;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function isValidCep(value: string): boolean {
  return digits(value).length === 8;
}

// ── Etapas e erros ──

export type StepId = "vendedor" | "conjuge" | "recebimento" | "revisao";
export type FichaErrors = Partial<Record<keyof FichaData, string>>;

export function getSteps(data: Pick<FichaData, "estadoCivil">): StepId[] {
  return hasPartner(data.estadoCivil)
    ? ["vendedor", "conjuge", "recebimento", "revisao"]
    : ["vendedor", "recebimento", "revisao"];
}

const REQUIRED = "Preencha este campo.";

function required(errors: FichaErrors, data: FichaData, key: keyof FichaData) {
  const value = data[key];
  if (typeof value === "string" && !value.trim()) errors[key] = REQUIRED;
}

export function validateStep(step: StepId, data: FichaData): FichaErrors {
  const errors: FichaErrors = {};

  if (step === "vendedor") {
    for (const key of [
      "nome", "documento", "orgaoExpedidor", "nacionalidade", "profissao", "estadoCivil",
      "logradouro", "numero", "bairro", "cidade",
    ] as const) required(errors, data, key);

    if (!errors.nome && data.nome.trim().split(/\s+/).length < 2) {
      errors.nome = "Informe o nome completo, com sobrenome.";
    }
    if (!isValidCpf(data.cpf)) errors.cpf = "CPF inválido. Confira os 11 números.";
    if (!isValidDate(data.nascimento)) errors.nascimento = "Data inválida. Use o formato dd/mm/aaaa.";
    if (hasPartner(data.estadoCivil)) required(errors, data, "regimeBens");
    if (!isValidCep(data.cep)) errors.cep = "CEP inválido. Informe os 8 números.";
    if (!isValidPhone(data.telefone)) errors.telefone = "Telefone inválido. Informe DDD e número.";
    if (data.email.trim() && !isValidEmail(data.email)) errors.email = "E-mail inválido.";
  }

  if (step === "conjuge") {
    for (const key of [
      "conjugeNome", "conjugeDocumento", "conjugeOrgaoExpedidor", "conjugeNacionalidade", "conjugeProfissao",
    ] as const) required(errors, data, key);

    if (!errors.conjugeNome && data.conjugeNome.trim().split(/\s+/).length < 2) {
      errors.conjugeNome = "Informe o nome completo, com sobrenome.";
    }
    if (!isValidCpf(data.conjugeCpf)) errors.conjugeCpf = "CPF inválido. Confira os 11 números.";
    if (!isValidDate(data.conjugeNascimento)) errors.conjugeNascimento = "Data inválida. Use o formato dd/mm/aaaa.";
    if (!isValidPhone(data.conjugeTelefone)) errors.conjugeTelefone = "Telefone inválido. Informe DDD e número.";
    if (data.conjugeEmail.trim() && !isValidEmail(data.conjugeEmail)) errors.conjugeEmail = "E-mail inválido.";
  }

  if (step === "recebimento") {
    if (data.metodos.length === 0) {
      errors.metodos = "Escolha pelo menos uma forma de recebimento.";
    }
    required(errors, data, "titular");
    if (!isValidCpfOrCnpj(data.titularDocumento)) {
      errors.titularDocumento = "CPF ou CNPJ inválido.";
    }
    if (data.metodos.includes("pix")) required(errors, data, "chavePix");
    if (data.metodos.includes("transferencia")) {
      for (const key of ["banco", "agencia", "conta"] as const) required(errors, data, key);
    }
  }

  if (step === "revisao" && !data.declaracao) {
    errors.declaracao = "Marque a declaração para enviar a ficha.";
  }

  return errors;
}

/** Valida todas as etapas ativas. Devolve a primeira etapa com erro, se houver. */
export function findFirstInvalidStep(data: FichaData): StepId | null {
  for (const step of getSteps(data)) {
    if (step === "revisao") continue;
    if (Object.keys(validateStep(step, data)).length > 0) return step;
  }
  return null;
}

// ── Mensagem do WhatsApp ──

const MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export function formatLongDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, "0")} de ${MONTHS[date.getMonth()]} de ${date.getFullYear()}`;
}

/** Remove caracteres que o WhatsApp interpreta como formatação e quebras de linha. */
function clean(value: string): string {
  return value.replace(/[*~`]/g, "").replace(/\s+/g, " ").trim();
}

type Line = [label: string, value: string];

function block(title: string, lines: Line[]): string {
  const body = lines
    .filter(([, value]) => clean(value))
    .map(([label, value]) => `*${label}:* ${clean(value)}`)
    .join("\n");
  return `*${title}*\n${body}`;
}

function joinAddress(data: FichaData): string {
  const street = [clean(data.logradouro), clean(data.numero)].filter(Boolean).join(", ");
  return [street, clean(data.complemento)].filter(Boolean).join(", ");
}

export function buildWhatsAppMessage(data: FichaData, now = new Date()): string {
  const parts: string[] = [
    "📋 *FICHA DO VENDEDOR*\n_Contrato de compra e venda de imóvel_",
  ];

  parts.push(
    block("1. DADOS DO VENDEDOR", [
      ["Nome completo", data.nome],
      ["CPF", data.cpf],
      [
        "RG ou CNH / órgão expedidor",
        [clean(data.documento), clean(data.orgaoExpedidor)].filter(Boolean).join(" / "),
      ],
      ["Data de nascimento", data.nascimento],
      ["Nacionalidade", data.nacionalidade],
      ["Profissão", data.profissao],
      ["Estado civil", data.estadoCivil],
      ["Regime de bens", hasPartner(data.estadoCivil) ? data.regimeBens : ""],
      ["Endereço", joinAddress(data)],
      ["Bairro", data.bairro],
      ["Cidade / UF", [clean(data.cidade), clean(data.uf)].filter(Boolean).join(" / ")],
      ["CEP", data.cep],
      ["Telefone / WhatsApp", data.telefone],
      ["E-mail", data.email],
    ]),
  );

  if (hasPartner(data.estadoCivil)) {
    parts.push(
      block("2. DADOS DO CÔNJUGE OU COMPANHEIRO(A)", [
        ["Regime de comunhão", data.regimeBens],
        ["Nome completo", data.conjugeNome],
        ["CPF", data.conjugeCpf],
        [
          "RG ou CNH / órgão expedidor",
          [clean(data.conjugeDocumento), clean(data.conjugeOrgaoExpedidor)].filter(Boolean).join(" / "),
        ],
        ["Data de nascimento", data.conjugeNascimento],
        ["Nacionalidade", data.conjugeNacionalidade],
        ["Profissão", data.conjugeProfissao],
        ["Telefone / WhatsApp", data.conjugeTelefone],
        ["E-mail", data.conjugeEmail],
        ["Endereço (se diferente)", data.conjugeEndereco],
      ]),
    );
  }

  const usesPix = data.metodos.includes("pix");
  const usesTransfer = data.metodos.includes("transferencia");
  parts.push(
    block(`${hasPartner(data.estadoCivil) ? "3" : "2"}. DADOS PARA RECEBIMENTO`, [
      ["Chave Pix", usesPix ? data.chavePix : ""],
      ["Titular da chave Pix ou da conta", data.titular],
      ["CPF / CNPJ do titular", data.titularDocumento],
      ["Banco", usesTransfer ? data.banco : ""],
      ["Agência", usesTransfer ? data.agencia : ""],
      ["Conta (com dígito)", usesTransfer ? data.conta : ""],
      ["Tipo de conta", usesTransfer ? data.tipoConta : ""],
    ]),
  );

  parts.push(
    "✅ _Declaro que todas as informações prestadas nesta ficha são verdadeiras e completas, " +
      "responsabilizando-me por sua veracidade para fins de elaboração do contrato de compra e venda._\n" +
      `Vargem Grande do Sul-SP, ${formatLongDate(now)}.`,
  );

  return parts.join("\n\n");
}
