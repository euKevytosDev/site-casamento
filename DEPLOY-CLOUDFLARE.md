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

## Domínio do casamento (ex.: rafaekevin.com.br)

O site do casal já roda em `somosloven.com.br/rafaekevin`. Para o domínio próprio:

1. Cloudflare → **Workers & Pages** → **loven** → **Custom domains** → **Set up a custom domain**
2. Adiciona `rafaekevin.com.br` e `www.rafaekevin.com.br`
3. No DNS do domínio (Hostinger/Registro.br/etc.), **remove** o apontamento antigo do GitHub Pages (`eukevytosdev.github.io`)
4. Cria o que o Cloudflare pedir (em geral):
   - `rafaekevin.com.br` → CNAME para `loven.pages.dev` **ou** nameservers Cloudflare
   - `www` → CNAME para `loven.pages.dev`
5. Espera SSL Active (pode levar alguns minutos)

O middleware já trata `rafaekevin.com.br` → slug `rafaekevin` (raiz = convite, não a landing).

## Depois de cada alteração

```bash
node scripts/build-pages.mjs
npx wrangler pages deploy dist-pages --project-name=loven
```
