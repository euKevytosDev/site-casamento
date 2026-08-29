# Deploy — dois projetos Cloudflare (definitivo)

## Regra de ouro

| Produto | Repositório | Comando | Projeto Cloudflare | Domínios |
|---------|-------------|---------|-------------------|----------|
| **Casamento** | `site-casamento-mobile-novo` | `node scripts/deploy-loven.mjs` | `loven` | `casamento.somosloven.com.br`, `rafaekevin.com.br` |
| **Surpresas** | `somosloven` | `node scripts/deploy-pages.mjs` | `loven-surpresa` | `somosloven.com.br`, `www.somosloven.com.br` |

**Nunca** rode `wrangler pages deploy` manualmente no frontend da surpresa apontando para `loven` — isso quebra o `rafaekevin.com.br`.

## Casamento (SaaS + seu convite)

```bash
cd site-casamento-mobile-novo
node scripts/deploy-loven.mjs
```

- `casamento.somosloven.com.br/` → landing do SaaS
- `casamento.somosloven.com.br/rafaekevin` → seu convite
- `rafaekevin.com.br/` → mesmo convite (domínio personalizado)

## Surpresas

```bash
cd somosloven
node scripts/deploy-pages.mjs
```

## DNS (uma vez no Cloudflare)

| Domínio | CNAME |
|---------|-------|
| `casamento.somosloven.com.br` | `loven.pages.dev` |
| `rafaekevin.com.br` / `www` | `loven.pages.dev` |
| `somosloven.com.br` / `www` | `loven-surpresa.pages.dev` |

No dashboard Cloudflare → Workers & Pages → cada projeto → Custom domains → confira que **somosloven.com.br não está no projeto `loven`**, só no `loven-surpresa`.
