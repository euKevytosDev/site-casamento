#!/usr/bin/env node
/**
 * Monta dist-pages/ para Cloudflare Pages:
 *   /                 → landing Loven
 *   /sofiaelucas      → convite (rewrite → /app/index.html)
 *   /admin            → painel
 */
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const LANDING = join(ROOT, "..", "site-casamento-landing");
const OUT = join(ROOT, "dist-pages");

function mustExist(p, label) {
  if (!existsSync(p)) {
    console.error(`Não achei ${label}: ${p}`);
    process.exit(1);
  }
}

mustExist(LANDING, "landing (../site-casamento-landing)");
mustExist(join(ROOT, "index.html"), "convite");

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// —— Landing na raiz ——
for (const f of ["index.html", "sucesso.html", "landing.css", "landing.js"]) {
  cpSync(join(LANDING, f), join(OUT, f));
}
cpSync(join(LANDING, "imagens"), join(OUT, "imagens"), { recursive: true });

// —— Convite em /app ——
const APP = join(OUT, "app");
mkdirSync(APP, { recursive: true });

const copyConvite = [
  "index.html",
  "404.html",
  "style.css",
  "script.js",
  "config.js",
  "favicon.ico",
];
for (const f of copyConvite) {
  const src = join(ROOT, f);
  if (existsSync(src)) cpSync(src, join(APP, f));
}
for (const dir of ["admin", "imagens", "musicas"]) {
  cpSync(join(ROOT, dir), join(APP, dir), { recursive: true });
}

// base href do convite → /app/
let idx = readFileSync(join(APP, "index.html"), "utf8");
idx = idx.replace(/<base href="\/">/, '<base href="/app/">');
if (!idx.includes('<base href="/app/">')) {
  idx = idx.replace("<head>", '<head>\n    <base href="/app/">');
}
writeFileSync(join(APP, "index.html"), idx);

if (existsSync(join(APP, "404.html"))) {
  let n404 = readFileSync(join(APP, "404.html"), "utf8");
  n404 = n404.replace(/<base href="\/">/, '<base href="/app/">');
  if (!n404.includes('<base href="/app/">')) {
    n404 = n404.replace("<head>", '<head>\n    <base href="/app/">');
  }
  writeFileSync(join(APP, "404.html"), n404);
}

// Rewrites Cloudflare Pages (arquivo estático ganha de redirect)
writeFileSync(
  join(OUT, "_redirects"),
  `# Painel (arquivos estáticos têm prioridade; isso só cobre /admin)
/admin /app/admin/index.html 200
/admin/ /app/admin/index.html 200
/admin/* /app/admin/:splat 200
`
);

// Function: /sofiaelucas → convite (não mexe em landing.css, imagens, etc.)
const fnDir = join(OUT, "functions");
mkdirSync(fnDir, { recursive: true });
writeFileSync(
  join(fnDir, "[slug].js"),
  `const RESERVED = new Set([
  "admin", "app", "imagens", "musicas", "landing", "api", "assets",
  "favicon.ico", "robots.txt", "sucesso.html", "index.html",
  "landing.css", "landing.js", "_headers", "_redirects"
]);

export async function onRequest(context) {
  const slug = String(context.params.slug || "").toLowerCase();
  if (!slug || slug.includes(".") || RESERVED.has(slug)) {
    return context.next();
  }
  if (!/^[a-z0-9-]{3,40}$/.test(slug)) {
    return context.next();
  }

  const url = new URL(context.request.url);
  return context.env.ASSETS.fetch(new URL("/app/index.html", url.origin));
}
`
);

writeFileSync(
  join(OUT, "_headers"),
  `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
`
);

console.log("OK →", OUT);
console.log("Deploy: npx wrangler pages deploy dist-pages --project-name=loven");
