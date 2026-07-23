# Cloudflare Pages — Loven

## O que sobe

| URL | Conteúdo |
|-----|----------|
| `somosloven.com.br/` | Landing |
| `somosloven.com.br/sofiaelucas` | Convite |
| `somosloven.com.br/admin/` | Painel |

## Build local

```bash
node scripts/build-pages.mjs
```

Gera a pasta `dist-pages/` (não versionada).

## Deploy (primeira vez)

1. Conta em https://dash.cloudflare.com (grátis)
2. No terminal:

```bash
npx wrangler login
node scripts/build-pages.mjs
npx wrangler pages deploy dist-pages --project-name=loven
```

3. No dashboard Cloudflare → **Workers & Pages** → projeto **loven** → **Custom domains**  
   → adiciona `somosloven.com.br` e `www.somosloven.com.br`

4. No registrador do domínio, aponta DNS conforme o Cloudflare mostrar (geralmente nameservers Cloudflare **ou** registro CNAME/`A`).

## Depois de cada alteração

```bash
node scripts/build-pages.mjs
npx wrangler pages deploy dist-pages --project-name=loven
```
