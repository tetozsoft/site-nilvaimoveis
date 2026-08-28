import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");

describe("SEO contract", () => {
  it("uses nilvaimoveis.com as the canonical fallback", () => {
    const seo = read("src/lib/seo.ts");
    const sitemap = read("src/app/sitemap.ts");
    const robots = read("src/app/robots.ts");

    assert.match(seo, /https:\/\/nilvaimoveis\.com/);
    assert.doesNotMatch(sitemap, /example\.com/);
    assert.match(sitemap, /getCanonicalBaseUrl/);
    assert.match(robots, /canonicalUrl\("\/sitemap\.xml"\)/);
  });

  it("publishes sitemap URLs and image hints from existing CDN listing data", () => {
    const cdn = read("src/lib/cdn.ts");
    const sitemap = read("src/app/sitemap.ts");

    assert.match(cdn, /fetchAllPropertySitemapItems/);
    assert.match(cdn, /imoveis\/listagem\/page-\$\{page\}\.json/);
    assert.match(cdn, /photo_urls\?\.full/);
    assert.match(sitemap, /images: \[item\.image\]/);
    assert.match(sitemap, /encodeURIComponent\(item\.slug\)/);
  });

  it("sets canonical URLs on public pages and dynamic property metadata", () => {
    const home = read("src/app/page.tsx");
    const listing = read("src/app/imoveis/page.tsx");
    const detail = read("src/app/imovel/[id]/page.tsx");
    const fallback = read("functions/imovel/[id].ts");

    assert.match(home, /alternates:\s*{\s*canonical:/s);
    assert.match(listing, /canonicalUrl\("\/imoveis"/);
    assert.match(detail, /canonicalUrl\(`\/imovel\/\$\{encodeURIComponent/);
    assert.doesNotMatch(detail, /config\.contact\.website \|\| ""/);
    assert.match(fallback, /<link rel="canonical"/);
    assert.match(fallback, /CANONICAL_SITE_URL = "https:\/\/nilvaimoveis\.com"/);
  });

  it("publishes an LLM-readable site guide", () => {
    const llms = read("public/llms.txt");

    assert.match(llms, /^# Nilva Imoveis/m);
    assert.match(llms, /https:\/\/nilvaimoveis\.com\/sitemap\.xml/);
    assert.match(llms, /Correspondente CAIXA Aqui/);
    assert.match(llms, /RealEstateListing/);
  });
});
