# Site Template

Template de site imobiliario com estilo customizavel por IA. Construido com Next.js 16, Tailwind CSS v4 e dados servidos via CDN.

## Stack

- **Next.js 16** — App Router, ISR, SSR metadata
- **React 19** — Server e Client Components
- **Tailwind CSS v4** — via `@tailwindcss/postcss`, sem `tailwind.config`
- **React Query** — fetch de dados client-side
- **Shadcn/ui** — componentes base (Radix + CVA)
- **Recharts** — graficos
- **Embla Carousel** — carrossel de imagens
- **Lucide React** — icones
- **TypeScript 5.8**

## Pre-requisitos

- Node.js 18+
- npm

## Setup

```bash
# Instalar dependencias
npm install

# Rodar em desenvolvimento
npm run dev
```

O projeto ja vem com um `.env` commitado contendo valores default. Para usar valores diferentes localmente, crie um `.env.local` (gitignored):

```bash
# .env.local (opcional — sobrescreve .env)
NEXT_PUBLIC_CDN_URL=https://sua-cdn.example.com
NEXT_PUBLIC_COMPANY_ID=seu-uuid-aqui
```

### Variaveis de Ambiente

| Variavel | Descricao | Exemplo |
|---|---|---|
| `NEXT_PUBLIC_CDN_URL` | URL base da CDN (Cloudflare R2) | `https://pub-xxx.r2.dev` |
| `NEXT_PUBLIC_COMPANY_ID` | UUID da imobiliaria na CDN | `e068a043-7384-...` |

Ambas sao `NEXT_PUBLIC_` — ficam expostas no bundle do client (nao sao secrets).

### Precedencia de arquivos `.env` (Next.js)

| Arquivo | Commitado | Quando carrega |
|---|---|---|
| `.env` | Sim | Sempre (defaults do projeto) |
| `.env.local` | Nao (gitignored) | Sempre (override local) |
| `.env.development` | Opcional | Apenas em `npm run dev` |
| `.env.production` | Opcional | Apenas em `npm run build` |

Next.js carrega na ordem acima. Valores em `.env.local` sobrescrevem `.env`.

## Comandos

```bash
npm run dev      # Servidor de desenvolvimento (porta 5080)
npm run build    # Build de producao
npm run start    # Servidor de producao (porta 5080)
npm run lint     # Linting com ESLint 9
```

## Estrutura do Projeto

```
src/
├── app/                 # Paginas e rotas (App Router)
│   ├── layout.tsx       # Layout raiz
│   ├── page.tsx         # Homepage
│   ├── not-found.tsx    # Pagina 404
│   ├── providers.tsx    # React Query + Theme providers
│   ├── globals.css      # Estilos globais + bridge Shadcn
│   ├── imoveis/         # Listagem de imoveis
│   ├── imovel/[id]/     # Detalhe do imovel (ISR)
│   ├── robots.ts        # robots.txt dinamico
│   └── sitemap.ts       # sitemap.xml dinamico
├── components/          # Componentes React reutilizaveis
│   ├── ui/              # Shadcn/ui (Button, Dialog, Card, etc.)
│   └── ...              # Componentes do site (Header, Hero, etc.)
├── contexts/            # React Context providers
│   └── SiteConfigContext.tsx  # Config da CDN + cores + favicon
├── hooks/               # Custom hooks
├── lib/                 # Utilitarios (cn, formatters)
├── data/                # Interfaces TypeScript
└── theme/               # Sistema de design (CSS) — UNICA PASTA EDITAVEL POR IA
    ├── tokens.css       # Cores, sombras, raios, espacamentos, transicoes
    ├── typography.css   # Familias de fonte, tamanhos, pesos, line-heights
    ├── animations.css   # Keyframes e variaveis de animacao
    ├── overrides.css    # Scrollbar, selection e overrides globais
    ├── index.css        # Barrel de imports (manter ordem!)
    └── variants/        # Estilos por componente (14 arquivos CSS)
        ├── button.css
        ├── card.css
        ├── badge.css
        ├── header.css
        ├── footer.css
        ├── hero.css
        ├── property-card.css
        ├── property-grid.css
        ├── filters.css
        ├── gallery.css
        ├── contact.css
        ├── testimonials.css
        ├── services.css
        └── about.css
```

## Arquitetura

### Dados via CDN

O site nao tem dados estaticos. Tudo vem de uma CDN (Cloudflare R2):

- **Config da empresa** — nome, logo, cores, contato
- **Imoveis** — listagem e detalhes
- **Cores do tema** — override automatico via `SiteConfigContext`

O fluxo:
1. `SiteConfigContext` busca config da CDN via React Query
2. Cores da CDN sobrescrevem CSS variables (`--color-primary-*`, `--color-accent-*`)
3. Favicon e gerado dinamicamente via canvas (logo da empresa ou inicial)
4. Loading gate impede renderizacao ate os dados chegarem

### Sistema de Temas

O estilo visual e separado da estrutura em `src/theme/`:

- **tokens.css** — Design tokens (cores HSL com canais separados para override em runtime)
- **typography.css** — Familias de fonte, escala tipografica
- **animations.css** — Keyframes e duracoes
- **variants/** — Cada componente tem seu arquivo CSS com classes BEM-like

As cores usam canais HSL separados (`--color-primary-h`, `-s`, `-l`) para que a CDN possa sobrescrever em runtime sem recompilar CSS.

### Personalizacao por IA

Este template foi projetado para ser customizado visualmente por uma IA. As regras de edicao estao documentadas em [`CLAUDE.md`](./CLAUDE.md):

- Apenas `src/theme/` e editavel
- Componentes, paginas e logica sao imutaveis
- Cores devem usar CSS variables, nunca valores hardcoded

---

## Arquivos Editaveis (para customizacao visual)

```
src/theme/tokens.css
src/theme/typography.css
src/theme/animations.css
src/theme/overrides.css
src/theme/index.css          (apenas para adicionar novos imports de variants)
src/theme/variants/*.css     (14 arquivos)
src/app/globals.css          (apenas @layer components e @layer utilities)
```

## Arquivos Protegidos (nao editar)

```
src/app/**/*.tsx
src/app/**/layout.tsx
src/app/**/page.tsx
src/components/**/*.tsx
src/hooks/**/*
src/lib/**/*
src/contexts/**/*
src/data/**/*
*.config.* (next.config.ts, postcss.config.js, eslint.config.mjs, tsconfig.json)
package.json
```

---

## Sistema de Tokens (`src/theme/tokens.css`)

### Cores Base (canais HSL separados)

As cores base usam canais separados para permitir override via CDN em runtime:

```css
--color-primary-h: 220    /* Hue */
--color-primary-s: 60%    /* Saturation */
--color-primary-l: 20%    /* Lightness */
--color-primary: hsl(var(--color-primary-h), var(--color-primary-s), var(--color-primary-l))

--color-secondary-h: 220
--color-secondary-s: 15%
--color-secondary-l: 96%

--color-accent-h: 38
--color-accent-s: 90%
--color-accent-l: 55%

--color-bg-h: 0
--color-bg-s: 0%
--color-bg-l: 100%
```

### Cores Derivadas

Geradas automaticamente a partir das cores base — nao precisam ser alteradas manualmente:

```css
--color-primary-light     /* color-mix 15% primary com branco */
--color-primary-dark      /* color-mix primary com 20% preto */
--color-accent-light      /* color-mix 20% accent com branco */
--color-accent-warm       /* hsl(45, 85%, 60%) */
--color-surface            /* alias de --color-bg */
--color-surface-raised     /* bg lightness - 2% */
--color-text               /* hsl(primary-h, 20%, 15%) */
--color-text-muted         /* hsl(primary-h, 10%, 50%) */
--color-border             /* hsl(primary-h, 15%, 90%) */
```

### Foregrounds

```css
--color-primary-fg: hsl(0, 0%, 100%)       /* texto sobre primary */
--color-accent-fg: hsl(primary-h, 60%, 15%) /* texto sobre accent */
```

### Gradientes

```css
--hero-overlay    /* linear-gradient overlay escuro para hero */
--gold-gradient   /* linear-gradient accent → accent-warm */
```

### Sombras

```css
--shadow-elegant  /* 0 4px 30px — sombra sutil */
--shadow-card     /* 0 10px 40px — sombra de card */
--shadow-hover    /* 0 20px 50px — sombra no hover */
```

### Espacamentos

```css
--space-section-y: 5rem        /* padding vertical de secao */
--space-section-y-md: 7rem     /* padding vertical em desktop */
--space-section-x: 1rem        /* padding horizontal mobile */
--space-section-x-md: 2rem     /* padding horizontal desktop */
```

### Raios de Borda

```css
--radius-sm: 0.375rem
--radius-md: 0.5rem
--radius-lg: 0.75rem
--radius-xl: 1rem
--radius-2xl: 1.5rem
--radius-full: 9999px
```

### Transicoes

```css
--ease-default: cubic-bezier(0.4, 0, 0.2, 1)
--duration-fast: 200ms
--duration-base: 300ms
--duration-slow: 500ms
--duration-slower: 700ms
--transition-colors   /* color, background-color, border-color */
--transition-all
--transition-transform
```

---

## Tipografia (`src/theme/typography.css`)

### Familias de Fonte

```css
--font-heading: 'Playfair Display', serif   /* titulos */
--font-body: 'Inter', sans-serif            /* texto geral */
--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace
```

Para trocar fontes: altere estas variaveis E atualize o `@import` do Google Fonts na **primeira linha** de `globals.css`.

### Tamanhos

```css
--text-xs: 0.75rem      --text-xl: 1.25rem     --text-5xl: 3rem
--text-sm: 0.875rem     --text-2xl: 1.5rem     --text-6xl: 3.75rem
--text-base: 1rem       --text-3xl: 1.875rem   --text-7xl: 4.5rem
--text-lg: 1.125rem     --text-4xl: 2.25rem
```

### Pesos e Line-Heights

```css
--weight-light: 300     --leading-tight: 1.15
--weight-normal: 400    --leading-snug: 1.35
--weight-medium: 500    --leading-normal: 1.5
--weight-semibold: 600  --leading-relaxed: 1.65
--weight-bold: 700
```

---

## Animacoes (`src/theme/animations.css`)

### Variaveis

```css
--anim-fade-up-distance: 30px
--anim-slide-in-distance: 20px
--anim-duration-fade-up: 0.8s
--anim-duration-fade-in: 0.6s
--anim-duration-slide-in: 0.6s
```

### Keyframes

```css
@keyframes fadeUp    /* opacity 0→1, translateY(distance)→0 */
@keyframes fadeIn    /* opacity 0→1 */
@keyframes slideIn   /* opacity 0→1, translateX(-distance)→0 */
```

### Classes de Animacao (em globals.css @layer utilities)

```css
.animate-fade-up    /* fadeUp 0.8s */
.animate-fade-in    /* fadeIn 0.6s */
.animate-slide-in   /* slideIn 0.6s */
.delay-100 a .delay-500  /* animation-delay */
```

---

## Variantes por Componente (`src/theme/variants/`)

Cada arquivo CSS controla a aparencia de um componente especifico. Convencao BEM-like: `.componente__elemento`.

### button.css
```css
.btn              /* base: padding, radius, transicao */
.btn--primary     /* fundo primary, texto branco */
.btn--secondary   /* fundo secondary */
.btn--outline     /* borda, fundo transparente */
.btn--accent      /* gradiente dourado */
```

### card.css
```css
.card             /* bg, borda, sombra, radius */
```

### badge.css
```css
.badge--featured  /* badge de destaque */
```

### header.css
```css
.site-header      /* header fixo */
.site-nav__link   /* links de navegacao */
.mobile-nav       /* menu mobile */
.mobile-nav a     /* links do menu mobile */
```

### footer.css
```css
.site-footer      /* rodape */
```

### hero.css
```css
.hero__overlay    /* overlay escuro sobre imagem */
.hero__title      /* titulo principal */
.hero__subtitle   /* subtitulo */
.hero__stats      /* container de estatisticas */
.hero__stats .stat-value   /* numero */
.hero__stats .stat-label   /* label */
```

### property-card.css
```css
.property-card              /* card de imovel */
.property-card__image img   /* imagem do imovel */
.property-card__badge       /* badge (venda/aluguel) */
.property-card__title       /* titulo do imovel */
.property-card__price       /* preco */
.property-card__meta        /* metadados (quartos, area) */
```

### property-grid.css
```css
.property-grid    /* grid responsivo de cards */
```

### filters.css
```css
.filters               /* container de filtros */
.filters__group label   /* labels dos filtros */
.filters__select        /* selects */
.filters__btn--active   /* botao ativo */
.filters__range         /* slider de range */
```

### gallery.css
```css
.property-detail       /* pagina de detalhe */
.property-gallery      /* galeria de fotos */
.property-gallery img  /* imagens da galeria */
.property-info h2      /* titulos de secao */
.property-features     /* lista de caracteristicas */
.property-agent        /* card do corretor */
```

### contact.css
```css
.contact-section                   /* secao de contato */
.contact-form                      /* formulario */
.contact-form .input               /* campos de input */
.contact-form .input::placeholder  /* placeholder */
.modal__overlay                    /* overlay do modal */
```

### testimonials.css
```css
.testimonials-section  /* secao de depoimentos */
.testimonial-card      /* card de depoimento */
```

### services.css
```css
.services-section  /* secao de servicos */
.services-card     /* card de servico */
```

### about.css
```css
.section__title      /* titulo de secao */
.section__highlight  /* texto em destaque */
```

---

## globals.css — Zonas Editaveis

O arquivo `globals.css` tem zonas fixas e zonas editaveis:

### NAO EDITAR (zonas fixas)
- Linha 1: `@import url(...)` do Google Fonts
- `@import "tailwindcss"`
- `@import "tw-animate-css"`
- `@import "../theme/index.css"`
- Bloco `@theme { ... }` (bridge Shadcn ↔ tokens)
- `@layer base` (mapeamento de cores Shadcn + dark mode)

### EDITAVEL
- `@layer components` — utilitarios de componente:
  ```css
  .text-gradient-gold   /* texto com gradiente dourado */
  .btn-primary          /* botao primary (atalho) */
  .btn-accent           /* botao accent/dourado */
  .section-padding      /* py-20 md:py-28 px-4 md:px-8 */
  .container-custom     /* max-w-7xl mx-auto */
  ```
- `@layer utilities` — classes de animacao:
  ```css
  .animate-fade-up
  .animate-fade-in
  .animate-slide-in
  .delay-100 a .delay-500
  ```

---

## Paginas

| Rota | Descricao |
|---|---|
| `/` | Homepage com hero, imoveis em destaque, servicos, depoimentos, contato |
| `/imoveis` | Listagem com filtros (tipo, quartos, preco, busca) |
| `/imovel/[id]` | Detalhe do imovel com galeria, info, corretor (ISR 10min) |

## Deploy

### Vercel (recomendado)

O projeto esta configurado para deploy na Vercel. As env vars precisam ser configuradas separadamente (nao usam o `.env` do repo):

```bash
# Linkar projeto
vercel link --yes

# Adicionar env vars (uma vez por environment)
echo "https://pub-xxx.r2.dev" | vercel env add NEXT_PUBLIC_CDN_URL production
echo "https://pub-xxx.r2.dev" | vercel env add NEXT_PUBLIC_CDN_URL preview
echo "seu-uuid" | vercel env add NEXT_PUBLIC_COMPANY_ID production
echo "seu-uuid" | vercel env add NEXT_PUBLIC_COMPANY_ID preview

# Deploy
vercel --prod
```

Tambem e possivel configurar via Vercel Dashboard: **Settings > Environment Variables**.

Pushes para `main` fazem deploy automatico (GitHub integration).

### Manual

```bash
npm run build
npm run start
```

Compativel com qualquer host Node.js. Certifique-se de que as env vars estejam definidas no ambiente de execucao.

## Licenca

Proprietario — TETOZ.
