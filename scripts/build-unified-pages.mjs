#!/usr/bin/env node
/**
 * Build unificado Pages `loven`:
 * - apex somosloven.com.br → surpresas (dearyou-clone/frontend)
 * - casamento.somosloven.com.br → SaaS casamento (dist-pages)
 */
import { cpSync, mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SURPRESA = join(ROOT, "../dearyou-clone/frontend");
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

// 4) headers
writeFileSync(
  join(OUT, "_headers"),
  `/*
  Cache-Control: public, max-age=300
`
);

console.log("OK →", OUT);
console.log("Deploy: npx wrangler pages deploy dist-unified --project-name=loven");
