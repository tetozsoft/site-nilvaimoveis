# Site Template — Regras para IA

## Permissoes de Edicao

### Arquivos editaveis (APENAS estes)

```
src/theme/tokens.css
src/theme/typography.css
src/theme/animations.css
src/theme/overrides.css
src/theme/index.css
src/theme/variants/*.css (todos os arquivos neste diretorio)
src/app/globals.css (apenas @layer components e @layer utilities)
```

### PROIBIDO editar

- Arquivos `.tsx` (componentes, paginas, layouts)
- Arquivos de logica (`hooks/`, `lib/`, `contexts/`, `providers/`)
- Arquivos de configuracao (`next.config.ts`, `postcss.config.js`, `tsconfig.json`, `package.json`)
- Zonas fixas do `globals.css` (`@theme`, `@layer base`, imports do topo)

### Leitura livre

Voce PODE ler qualquer arquivo para entender componentes, classes CSS, e dados. Edicao e restrita aos arquivos acima.

---

## Dados da CDN

Os dados vem de arquivos JSON estaticos. Para entender a estrutura, leia os arquivos .tsx dos componentes que os consomem.

### Regras

1. PROIBIDO remover dados da CDN do template. Todos os campos renderizados DEVEM permanecer.
2. Ocultar dados via CSS (`display:none`) so com confirmacao explicita do usuario.
3. Conteudo que NAO vem da CDN (decorativo, hardcoded) pode ser alterado livremente.

---

## CSS Custom Properties (tokens disponiveis)

Cores: `--color-primary`, `--color-secondary`, `--color-accent`, `--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-primary-hover`, `--color-primary-light`
Spacing: `--space-xs`, `--space-sm`, `--space-md`, `--space-lg`, `--space-xl`, `--space-2xl`, `--space-3xl`, `--space-section`
Radius: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-full`
Shadows: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`
Motion: `--ease-default`, `--duration-fast`, `--duration-normal`, `--duration-slow`
Typography: `--font-heading`, `--font-body`, `--text-xs` a `--text-5xl`, `--weight-normal`/`medium`/`semibold`/`bold`

As cores `--color-primary`/`secondary`/`accent`/`bg` sao injetadas em runtime pelo ThemeProvider. Use SEMPRE tokens, nunca hardcode valores.

---

## Regras de Qualidade

- Mobile-first: funcionar de 320px a 2560px
- BEM naming: `.block`, `.block__element`, `.block--modifier`
- Nunca usar cores hex/rgb hardcoded — usar tokens
- Nunca usar inline styles nos componentes

## Verificacao UX (OBRIGATORIA antes de finalizar)

Antes de considerar a tarefa concluida, releia TODOS os arquivos CSS que voce editou e verifique:

1. **Contraste texto/fundo**: Nenhuma cor de fonte pode ser proxima da cor de fundo. Texto DEVE ser legivel. Use `--color-text` sobre `--color-bg`, `--color-text-muted` sobre `--color-surface`. Se usar cor clara no texto, o fundo DEVE ser escuro e vice-versa.
2. **Tamanho de fontes**: Font-sizes NAO podem exceder o espaco do container pai. Titulos grandes (`--text-4xl`, `--text-5xl`) so em hero/banner. Secoes normais: maximo `--text-3xl`. Cards: maximo `--text-xl`.
3. **Overflow proibido**: Nenhum elemento pode vazar do container pai. Se o texto for longo, use `overflow-wrap: break-word` ou `text-overflow: ellipsis`.
4. **Hierarquia visual**: Titulos > subtitulos > corpo. Manter proporcao consistente entre secoes.
5. **Acessibilidade**: Contraste WCAG AA (4.5:1 texto normal, 3:1 texto grande), touch targets minimo 44x44px.

Se encontrar QUALQUER problema acima, corrija ANTES de finalizar.
