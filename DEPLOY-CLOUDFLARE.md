# Cloudflare Pages — Loven

## Deploy unificado (surpresas + casamento)

O projeto Pages **`loven`** serve os dois produtos por hostname:

| Host | Conteúdo |
|------|----------|
| `somosloven.com.br` | Surpresas |
| `casamento.somosloven.com.br` | Landing + convites + admin |

```bash
node scripts/deploy-loven.mjs
```

> **Importante:** nunca faça `wrangler pages deploy` direto na pasta `somosloven/frontend`.
> Isso sobrescreve o middleware e faz `rafaekevin.com.br` cair na página de surpresas de novo.

Se `casamento.somosloven.com.br` ficar pending, crie no DNS da zona:

- `casamento` → CNAME `loven.pages.dev` (proxied)
- `www` → CNAME `loven.pages.dev` (proxied)

## O que sobe (legado / referência)

| URL | Conteúdo |
|-----|----------|
| `casamento.somosloven.com.br/` | Landing |
| `casamento.somosloven.com.br/sofiaelucas` | Convite |
| `casamento.somosloven.com.br/admin/` | Painel |

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
   → adiciona `casamento.somosloven.com.br`

> O apex `somosloven.com.br` fica no projeto **loven-surpresa** (produto de surpresas).

4. No registrador do domínio, aponta DNS conforme o Cloudflare mostrar (geralmente nameservers Cloudflare **ou** registro CNAME/`A`).

## Domínio do casamento (ex.: rafaekevin.com.br)

O site do casal já roda em `casamento.somosloven.com.br/rafaekevin`. Para o domínio próprio:

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
node scripts/deploy-loven.mjs
```

> **Importante:** nunca faça `wrangler pages deploy` direto na pasta `somosloven/frontend`.
> Isso sobrescreve o middleware e faz `rafaekevin.com.br` cair na página de surpresas de novo.
