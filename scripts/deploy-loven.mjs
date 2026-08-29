#!/usr/bin/env node
/**
 * Deploy do SaaS CASAMENTO → Cloudflare Pages `loven`.
 *
 * Domínios deste projeto (somente casamento):
 * - casamento.somosloven.com.br
 * - rafaekevin.com.br / www.rafaekevin.com.br
 *
 * Surpresas → projeto `loven-surpresa` (repo somosloven).
 * NUNCA misture os dois no mesmo deploy.
 */
import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "dist-pages");
const MIDDLEWARE = join(OUT, "functions", "_middleware.js");
const CONVITE = join(OUT, "app", "convite.html");
const PROJECT = "loven";

function run(cmd, args, cwd = ROOT) {
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: false });
  if (r.status !== 0) process.exit(r.status || 1);
}

function assertDeployBundle() {
  if (!existsSync(MIDDLEWARE)) {
    console.error("ERRO: dist-pages/functions/_middleware.js ausente.");
    process.exit(1);
  }
  if (!existsSync(CONVITE)) {
    console.error("ERRO: dist-pages/app/convite.html ausente.");
    process.exit(1);
  }
  if (existsSync(join(OUT, "criar.html"))) {
    console.error("ERRO: bundle parece ser da SURPRESA (criar.html na raiz).");
    console.error("Use o deploy do repo somosloven → projeto loven-surpresa.");
    process.exit(1);
  }

  const mw = readFileSync(MIDDLEWARE, "utf8");
  const required = ["rafaekevin.com.br", "handleWedding", "CUSTOM_DOMAIN_SLUG", "/app/convite.html"];
  for (const token of required) {
    if (!mw.includes(token)) {
      console.error(`ERRO: middleware de casamento incompleto (falta "${token}").`);
      process.exit(1);
    }
  }
  if (mw.includes("handleSurpresa")) {
    console.error("ERRO: middleware unificado detectado — use _middleware.casamento.js no build.");
    process.exit(1);
  }
}

console.log(`→ build casamento (dist-pages)…`);
run("node", ["scripts/build-pages.mjs"]);

console.log("→ validando bundle…");
assertDeployBundle();

console.log(`→ deploy Cloudflare Pages (${PROJECT}) — só casamento…`);
run("npx", ["wrangler", "pages", "deploy", "dist-pages", "--project-name", PROJECT, "--commit-dirty=true"]);

console.log("OK — casamento no ar.");
console.log("Surpresas: cd ../somosloven && node scripts/deploy-pages.mjs");
