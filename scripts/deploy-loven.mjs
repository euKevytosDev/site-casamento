#!/usr/bin/env node
/**
 * Deploy seguro do Cloudflare Pages `loven`.
 * Sempre usa o build unificado (surpresas + casamento + middleware por host).
 *
 * NÃO rode `wrangler pages deploy` direto em somosloven/frontend —
 * isso quebra rafaekevin.com.br e casamento.somosloven.com.br.
 */
import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "dist-unified");
const MIDDLEWARE = join(OUT, "functions", "_middleware.js");
const CONVITE = join(OUT, "casamento", "app", "convite.html");

function run(cmd, args, cwd = ROOT) {
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: false });
  if (r.status !== 0) process.exit(r.status || 1);
}

function assertDeployBundle() {
  if (!existsSync(MIDDLEWARE)) {
    console.error("ERRO: dist-unified/functions/_middleware.js ausente.");
    console.error("Use: node scripts/build-unified-pages.mjs");
    process.exit(1);
  }
  if (!existsSync(CONVITE)) {
    console.error("ERRO: dist-unified/casamento/app/convite.html ausente.");
    process.exit(1);
  }

  const mw = readFileSync(MIDDLEWARE, "utf8");
  const required = ["WEDDING_DOMAINS", "rafaekevin.com.br", "handleWedding", "CUSTOM_DOMAIN_SLUG"];
  for (const token of required) {
    if (!mw.includes(token)) {
      console.error(`ERRO: middleware incompleto (falta "${token}").`);
      console.error("Provável deploy só da surpresa — abortando.");
      process.exit(1);
    }
  }
}

console.log("→ build unificado…");
run("node", ["scripts/build-unified-pages.mjs"]);

console.log("→ validando bundle…");
assertDeployBundle();

console.log("→ deploy Cloudflare Pages (loven)…");
run("npx", ["wrangler", "pages", "deploy", "dist-unified", "--project-name=loven", "--commit-dirty=true"]);

console.log("OK — loven no ar com roteamento de casamento.");
