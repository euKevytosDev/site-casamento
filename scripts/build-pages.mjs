#!/usr/bin/env node
/**
 * Monta dist-pages/ para Cloudflare Pages:
 *   /                 → landing Loven
 *   /sofiaelucas      → convite (Function em /functions)
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
mustExist(join(ROOT, "functions", "_middleware.js"), "functions/_middleware.js");

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

for (const f of ["index.html", "sucesso.html", "landing.css", "landing.js"]) {
  cpSync(join(LANDING, f), join(OUT, f));
}
cpSync(join(LANDING, "imagens"), join(OUT, "imagens"), { recursive: true });
const landingFavicon = join(LANDING, "favicon.ico");
if (existsSync(landingFavicon)) {
  cpSync(landingFavicon, join(OUT, "favicon.ico"));
}
const APP = join(OUT, "app");
mkdirSync(APP, { recursive: true });

for (const f of ["style.css", "script.js", "config.js", "favicon.ico"]) {
  const src = join(ROOT, f);
  if (existsSync(src)) cpSync(src, join(APP, f));
}
for (const dir of ["admin", "imagens", "musicas"]) {
  cpSync(join(ROOT, dir), join(APP, dir), { recursive: true });
}

let idx = readFileSync(join(ROOT, "index.html"), "utf8");
idx = idx.replace(/<base href="\/">/, '<base href="/app/">');
if (!idx.includes('<base href="/app/">')) {
  idx = idx.replace("<head>", '<head>\n    <base href="/app/">');
}
writeFileSync(join(APP, "convite.html"), idx);
writeFileSync(join(APP, "index.html"), idx);

writeFileSync(
  join(OUT, "_redirects"),
  `/admin /app/admin/index.html 200
/admin/ /app/admin/index.html 200
/admin/* /app/admin/:splat 200
`
);

writeFileSync(
  join(OUT, "_routes.json"),
  JSON.stringify(
    {
      version: 1,
      include: ["/*"],
      exclude: [
        "/app/*",
        "/imagens/*",
        "/landing.css",
        "/landing.js",
        "/sucesso.html",
        "/favicon.ico",
        "/index.html",
      ],
    },
    null,
    2
  )
);

writeFileSync(
  join(OUT, "_headers"),
  `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
`
);

console.log("OK →", OUT);
console.log("Deploy: npx wrangler pages deploy");
