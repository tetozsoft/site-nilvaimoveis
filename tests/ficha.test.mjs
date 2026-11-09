import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  EMPTY_FICHA,
  FICHA_COPY,
  buildWhatsAppMessage,
  findFirstInvalidStep,
  getSteps,
  isValidCnpj,
  isValidCpf,
  isValidDate,
  maskCpf,
  maskCpfOrCnpj,
  maskDate,
  maskPhone,
  validateStep,
} from "../src/lib/ficha.ts";

const base = {
  ...EMPTY_FICHA,
  nome: "Maria da Silva Santos",
  cpf: "529.982.247-25",
  documento: "12.345.678-9",
  orgaoExpedidor: "SSP-SP",
  nascimento: "15/03/1980",
  profissao: "Professora",
  estadoCivil: "Solteiro(a)",
  cep: "13880-000",
  logradouro: "Rua das Flores",
  numero: "120",
  bairro: "Centro",
  cidade: "Vargem Grande do Sul",
  uf: "SP",
  telefone: "(19) 99843-4363",
  email: "maria@email.com",
  chavePix: "529.982.247-25",
  titular: "Maria da Silva Santos",
  titularDocumento: "529.982.247-25",
  declaracao: true,
};

describe("ficha do vendedor: máscaras", () => {
  it("formata CPF, telefone, data e CPF/CNPJ", () => {
    assert.equal(maskCpf("52998224725"), "529.982.247-25");
    assert.equal(maskPhone("19998434363"), "(19) 99843-4363");
    assert.equal(maskPhone("1938811234"), "(19) 3881-1234");
    assert.equal(maskDate("15031980"), "15/03/1980");
    assert.equal(maskCpfOrCnpj("11222333000181"), "11.222.333/0001-81");
    assert.equal(maskCpfOrCnpj("52998224725"), "529.982.247-25");
  });
});

describe("ficha do vendedor: validação", () => {
  it("valida CPF e CNPJ pelos dígitos verificadores", () => {
    assert.ok(isValidCpf("529.982.247-25"));
    assert.ok(!isValidCpf("529.982.247-24"));
    assert.ok(!isValidCpf("111.111.111-11"));
    assert.ok(isValidCnpj("11.222.333/0001-81"));
    assert.ok(!isValidCnpj("11.222.333/0001-82"));
  });

  it("recusa datas impossíveis ou no futuro", () => {
    assert.ok(isValidDate("29/02/2024"));
    assert.ok(!isValidDate("31/04/1990"));
    assert.ok(!isValidDate("15/03/2999"));
  });

  it("aceita uma ficha completa de solteiro sem etapa de cônjuge", () => {
    assert.deepEqual(getSteps(base), ["vendedor", "recebimento", "revisao"]);
    assert.equal(findFirstInvalidStep(base), null);
    assert.deepEqual(validateStep("revisao", base), {});
  });

  it("exige regime de bens e cônjuge para casado(a)", () => {
    const casado = { ...base, estadoCivil: "Casado(a)" };
    assert.deepEqual(getSteps(casado), ["vendedor", "conjuge", "recebimento", "revisao"]);
    assert.ok(validateStep("vendedor", casado).regimeBens);
    assert.ok(validateStep("conjuge", casado).conjugeNome);
  });

  it("exige a chave Pix ou os dados da conta conforme a escolha", () => {
    const semPix = { ...base, chavePix: "" };
    assert.ok(validateStep("recebimento", semPix).chavePix);

    const soConta = { ...base, metodos: ["transferencia"], chavePix: "" };
    const erros = validateStep("recebimento", soConta);
    assert.ok(erros.banco && erros.agencia && erros.conta);
    assert.equal(erros.chavePix, undefined);

    assert.ok(validateStep("recebimento", { ...base, metodos: [] }).metodos);
  });

  it("exige a declaração de veracidade", () => {
    assert.ok(validateStep("revisao", { ...base, declaracao: false }).declaracao);
  });
});

describe("ficha do vendedor: mensagem do WhatsApp", () => {
  const now = new Date(2026, 10, 9);

  it("usa negrito do WhatsApp nos títulos e rótulos", () => {
    const msg = buildWhatsAppMessage(base, now);
    assert.match(msg, /\*FICHA DO VENDEDOR\*/);
    assert.match(msg, /\*1\. DADOS DO VENDEDOR\*/);
    assert.match(msg, /\*Nome completo:\* Maria da Silva Santos/);
    assert.match(msg, /\*2\. DADOS PARA RECEBIMENTO\*/);
    assert.match(msg, /\*Chave Pix:\* 529\.982\.247-25/);
    assert.match(msg, /Vargem Grande do Sul-SP, 09 de novembro de 2026\./);
    assert.doesNotMatch(msg, /CÔNJUGE/);
  });

  it("inclui o cônjuge e renumera as seções quando casado(a)", () => {
    const msg = buildWhatsAppMessage(
      { ...base, estadoCivil: "Casado(a)", regimeBens: "Comunhão parcial de bens", conjugeNome: "João Santos", conjugeCpf: "111.444.777-35" },
      now,
    );
    assert.match(msg, /\*2\. DADOS DO CÔNJUGE OU COMPANHEIRO\(A\)\*/);
    assert.match(msg, /\*3\. DADOS PARA RECEBIMENTO\*/);
    assert.match(msg, /\*Regime de bens:\* Comunhão parcial de bens/);
  });

  it("omite campos vazios e remove marcas que quebram o negrito", () => {
    const msg = buildWhatsAppMessage({ ...base, email: "", complemento: "", profissao: "Prof *Dra* ~x~" }, now);
    assert.doesNotMatch(msg, /E-mail:/);
    assert.doesNotMatch(msg, /Complemento/);
    assert.match(msg, /\*Profissão:\* Prof Dra x/);
  });

  it("mostra só os dados da conta quando o recebimento é por transferência", () => {
    const msg = buildWhatsAppMessage(
      { ...base, metodos: ["transferencia"], chavePix: "", banco: "Caixa", agencia: "0123", conta: "45678-9" },
      now,
    );
    assert.doesNotMatch(msg, /Chave Pix/);
    assert.match(msg, /\*Banco:\* Caixa/);
    assert.match(msg, /\*Conta \(com dígito\):\* 45678-9/);
  });

  it("cabe no link do WhatsApp mesmo com ficha completa de casado(a)", () => {
    const completa = {
      ...base,
      estadoCivil: "Casado(a)",
      regimeBens: "Participação final nos aquestos",
      complemento: "Apartamento 12, bloco B",
      metodos: ["pix", "transferencia"],
      banco: "Banco do Brasil",
      agencia: "1234-5",
      conta: "123456-7",
      conjugeNome: "João Pedro de Almeida Santos",
      conjugeCpf: "111.444.777-35",
      conjugeDocumento: "98.765.432-1",
      conjugeOrgaoExpedidor: "SSP-SP",
      conjugeNascimento: "02/07/1978",
      conjugeProfissao: "Engenheiro civil",
      conjugeTelefone: "(19) 99999-8888",
      conjugeEmail: "joao@email.com",
      conjugeEndereco: "Rua das Palmeiras, 55, Jardim Europa, São João da Boa Vista/SP",
    };
    const url = `https://wa.me/5519998434363?text=${encodeURIComponent(buildWhatsAppMessage(completa, now))}`;
    assert.ok(url.length < 4000, `link com ${url.length} caracteres`);
  });
});

describe("ficha do comprador", () => {
  const now = new Date(2026, 10, 9);
  const msg = buildWhatsAppMessage(base, now, "comprador");

  it("troca os títulos e mantém a estrutura da ficha", () => {
    assert.match(msg, /\*FICHA DO COMPRADOR\*/);
    assert.match(msg, /\*1\. DADOS DO COMPRADOR\*/);
    assert.match(msg, /\*2\. DADOS BANCÁRIOS\*/);
    assert.match(msg, /\*Nome completo:\* Maria da Silva Santos/);
    assert.doesNotMatch(msg, /VENDEDOR|RECEBIMENTO/);
  });

  it("numera cônjuge e dados bancários como na ficha do vendedor", () => {
    const casado = buildWhatsAppMessage({ ...base, estadoCivil: "União estável", regimeBens: "Comunhão parcial de bens" }, now, "comprador");
    assert.match(casado, /\*2\. DADOS DO CÔNJUGE OU COMPANHEIRO\(A\)\*/);
    assert.match(casado, /\*3\. DADOS BANCÁRIOS\*/);
  });

  it("usa rascunhos separados para cada ficha", () => {
    assert.notEqual(FICHA_COPY.comprador.draftKey, FICHA_COPY.vendedor.draftKey);
    assert.equal(FICHA_COPY.comprador.path, "/ficha-comprador");
  });
});

describe("ficha do vendedor: integração no site", () => {
  const read = (path) => readFileSync(join(process.cwd(), path), "utf8");

  it("fica fora dos buscadores e fora do sitemap", () => {
    assert.match(read("src/components/FichaPage.tsx"), /robots:\s*{\s*index:\s*false/s);
    assert.doesNotMatch(read("src/app/sitemap.ts"), /ficha-(vendedor|comprador)/);
  });

  it("tem link no cabeçalho e no rodapé", () => {
    assert.match(read("src/components/Header.tsx"), /\/ficha-vendedor/);
    assert.match(read("src/components/Footer.tsx"), /\/ficha-vendedor/);
    assert.match(read("src/components/Header.tsx"), /\/ficha-comprador/);
    assert.match(read("src/components/Footer.tsx"), /\/ficha-comprador/);
  });
});
