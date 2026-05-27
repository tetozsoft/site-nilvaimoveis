import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");

describe("Splendido visual replica contract", () => {
  it("preserves CDN endpoint contracts", () => {
    const cdn = read("src/lib/cdn.ts");

    for (const endpoint of [
      "config.json",
      "destaques.json",
      "imoveis/listagem/page-${page}.json",
      "imoveis/detalhe/${slug}.json",
      "meta.json",
    ]) {
      assert.match(cdn, new RegExp(endpoint.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }

    assert.match(cdn, /NEXT_PUBLIC_CDN_URL/);
    assert.match(cdn, /NEXT_PUBLIC_COMPANY_ID/);
  });

  it("keeps Splendido skin colors independent from CDN brand color overrides", () => {
    const provider = read("src/contexts/SiteConfigContext.tsx");

    assert.doesNotMatch(provider, /\["primary",\s*config\.primary_color\]/);
    assert.doesNotMatch(provider, /\["accent",\s*config\.secondary_color\]/);
    assert.doesNotMatch(provider, /\["footer-bg",\s*config\.footer_bg_color\]/);
  });

  it("keeps public routes available", () => {
    for (const path of [
      "src/app/page.tsx",
      "src/app/imoveis/page.tsx",
      "src/app/imoveis/ImoveisClient.tsx",
      "src/app/imovel/[id]/page.tsx",
      "src/app/imovel/[id]/PropertyDetailsClient.tsx",
    ]) {
      assert.ok(existsSync(join(root, path)), `${path} should exist`);
    }
  });

  it("renders Splendido-style header and quick search markers", () => {
    const header = read("src/components/Header.tsx");
    const search = read("src/components/SearchBar.tsx");

    assert.match(header, /site-header__top/);
    assert.match(header, /site-header__quick/);
    assert.match(header, /findfast/i);
    assert.match(search, /quick-search/);
    assert.match(search, /quick-search__submit/);
    assert.match(search, /<h2>Encontre seu imóvel<\/h2>/);
    assert.doesNotMatch(search, /<h1/);
    assert.match(search, /available_filters\?\.quartos/);
  });

  it("renders Splendido-style listings and property cards", () => {
    const listing = read("src/app/imoveis/ImoveisClient.tsx");
    const card = read("src/components/PropertyCardItem.tsx");

    assert.match(listing, /listing-shell/);
    assert.match(listing, /listing-sidebar/);
    assert.match(listing, /listing-toolbar/);
    assert.match(card, /property-card__reference/);
    assert.match(card, /property-card__bottom/);
  });

  it("renders Splendido-style property detail shell", () => {
    const detail = read("src/app/imovel/[id]/PropertyDetailsClient.tsx");

    assert.match(detail, /detail-shell/);
    assert.match(detail, /detail-main-card/);
    assert.match(detail, /detail-price-panel/);
    assert.match(detail, /detail-contact-card/);
  });

  it("renders maximum-highlight CAIXA financing surfaces without backend changes", () => {
    const home = read("src/app/page.tsx");
    const hero = read("src/components/Hero.tsx");
    const header = read("src/components/Header.tsx");
    const listing = read("src/app/imoveis/ImoveisClient.tsx");
    const detail = read("src/app/imovel/[id]/PropertyDetailsClient.tsx");
    const css = read("src/theme/variants/property-grid.css");

    assert.match(home, /CaixaFinancing/);
    assert.match(hero, /hero-caixa-seal/);
    assert.match(header, /Financiamento CAIXA/);
    assert.match(listing, /listing-caixa-banner/);
    assert.match(detail, /detail-price-panel__caixa/);
    assert.match(css, /#005CA9/);
    assert.match(css, /#F39200/);
    assert.match(css, /#financiamento-caixa/);
  });
});
