#!/usr/bin/env node
/**
 * Build unificado Pages `loven`:
 * - apex somosloven.com.br → SaaS casamento (landing, /{slug}, admin)
 * - casamento.somosloven.com.br → mesmo app
 * O frontend das surpresas ainda entra no bundle (legado), mas o middleware
 * só serve casamento. Favicon da raiz é sobrescrito pelo selo da landing.
 */
import { cpSync, mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SURPRESA = join(ROOT, "../somosloven/frontend");
const OUT = join(ROOT, "dist-unified");
const WEDDING_DIST = join(ROOT, "dist-pages");

function run(cmd, args, cwd = ROOT) {
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: false });
  if (r.status !== 0) process.exit(r.status || 1);
}

// 1) build casamento
run("node", ["scripts/build-pages.mjs"]);

if (!existsSync(SURPRESA)) {
  console.error("Frontend surpresas não encontrado:", SURPRESA);
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// 2) surpresas na raiz
cpSync(SURPRESA, OUT, { recursive: true });
rmSync(join(OUT, "functions"), { recursive: true, force: true });

// 3) casamento em /casamento/
mkdirSync(join(OUT, "casamento"), { recursive: true });
cpSync(WEDDING_DIST, join(OUT, "casamento"), { recursive: true });
// não levar functions/_routes do wedding para dentro de /casamento
rmSync(join(OUT, "casamento", "functions"), { recursive: true, force: true });
for (const f of ["_routes.json", "_redirects", "_headers"]) {
  rmSync(join(OUT, "casamento", f), { force: true });
}

// 3b) Favicon da ABA = selo dourado (não o coração rosa das surpresas na raiz)
const weddingFavicon = join(OUT, "casamento", "favicon.ico");
const weddingFav32 = join(OUT, "casamento", "imagens", "favicon-32x32.png");
const weddingFav96 = join(OUT, "casamento", "imagens", "favicon-96x96.png");
const weddingApple = join(OUT, "casamento", "imagens", "apple-touch-icon.png");
if (existsSync(weddingFavicon)) {
  cpSync(weddingFavicon, join(OUT, "favicon.ico"));
}
if (existsSync(weddingFav32)) {
  mkdirSync(join(OUT, "assets", "icons"), { recursive: true });
  cpSync(weddingFav32, join(OUT, "assets", "icons", "favicon-32.png"));
  // SVG rosa das surpresas — some pra aba não preferir ele
  rmSync(join(OUT, "assets", "icons", "favicon.svg"), { force: true });
  writeFileSync(
    join(OUT, "assets", "icons", "favicon.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><image href="/imagens/favicon-32x32.png" width="32" height="32"/></svg>\n`
  );
}
if (existsSync(weddingApple)) {
  cpSync(weddingApple, join(OUT, "apple-touch-icon.png"));
  cpSync(weddingApple, join(OUT, "icon-share.png"));
}
// Espelha PNGs de favicon também em /imagens na raiz (caminhos relativos da landing)
mkdirSync(join(OUT, "imagens"), { recursive: true });
for (const f of ["favicon-32x32.png", "favicon-96x96.png", "apple-touch-icon.png", "selo.png"]) {
  const src = join(OUT, "casamento", "imagens", f);
  if (existsSync(src)) cpSync(src, join(OUT, "imagens", f));
}

// 4) Functions na raiz do deploy (host routing surpresa vs casamento)
const FN = join(ROOT, "functions");
if (existsSync(FN)) {
  cpSync(FN, join(OUT, "functions"), { recursive: true });
}

// 5) headers — HTML sem cache longo; assets versionados podem cachear
writeFileSync(
  join(OUT, "_headers"),
  `/criar
  Cache-Control: no-cache, no-store, must-revalidate
/criar.html
  Cache-Control: no-cache, no-store, must-revalidate
/editar
  Cache-Control: no-cache, no-store, must-revalidate
/editar.html
  Cache-Control: no-cache, no-store, must-revalidate
/*.html
  Cache-Control: no-cache, no-store, must-revalidate
/casamento/app/*
  Cache-Control: public, max-age=300
/js/criar.*
  Cache-Control: public, max-age=31536000, immutable
/css/criar.*
  Cache-Control: public, max-age=31536000, immutable
/*
  Cache-Control: public, max-age=60
`
);

// 6) _routes: worker só em HTML/slugs; assets estáticos do convite passam direto
writeFileSync(
  join(OUT, "_routes.json"),
  JSON.stringify(
    {
      version: 1,
      include: ["/*"],
      exclude: [
        "/casamento/app/*",
        "/casamento/imagens/*",
        "/casamento/landing.css",
        "/casamento/landing.js",
        "/css/*",
        "/js/*",
        "/assets/*",
        "/favicon.ico",
        "/og.jpg",
        "/icon-share.png",
      ],
    },
    null,
    2
  )
);

const middlewarePath = join(OUT, "functions", "_middleware.js");
const convitePath = join(OUT, "casamento", "app", "convite.html");
if (!existsSync(middlewarePath) || !existsSync(convitePath)) {
  console.error("Build incompleto: middleware ou convite ausente em dist-unified.");
  process.exit(1);
}
const mw = readFileSync(middlewarePath, "utf8");
if (!mw.includes("rafaekevin.com.br") || !mw.includes("handleWedding")) {
  console.error("Middleware sem roteamento de casamento — abortando build.");
  process.exit(1);
}

console.log("OK →", OUT);
console.log("Deploy: node scripts/deploy-loven.mjs");
