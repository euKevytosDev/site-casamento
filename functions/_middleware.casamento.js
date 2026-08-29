/**
 * Middleware só do SaaS casamento (projeto Pages `loven`).
 * Surpresas ficam no projeto separado `loven-surpresa`.
 *
 * Hosts:
 * - casamento.somosloven.com.br → landing + /slug
 * - rafaekevin.com.br → slug rafaekevin na raiz
 */

const CUSTOM_DOMAIN_SLUG = {
  "rafaekevin.com.br": "rafaekevin",
  "www.rafaekevin.com.br": "rafaekevin",
};

const WEDDING_RESERVED = new Set([
  "admin",
  "app",
  "imagens",
  "musicas",
  "landing",
  "api",
  "assets",
  "favicon.ico",
  "robots.txt",
  "sucesso.html",
  "index.html",
  "landing.css",
  "landing.js",
  "privacidade.html",
  "termos.html",
  "exclusao-de-conta.html",
]);

const API_BASE = "https://site-casamento-backend-nrfb.onrender.com";
const API_TIMEOUT_MS = 4000;

async function fetchWithTimeout(url, options = {}, timeoutMs = API_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function absUrl(origin, path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${origin}/${String(path).replace(/^\//, "")}`;
}

function injectOg(html, { title, description, url, image }) {
  const block = [
    `<meta property="og:type" content="website">`,
    `<meta property="og:locale" content="pt_BR">`,
    `<meta property="og:site_name" content="Loven">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:image" content="${esc(image)}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(description)}">`,
    `<meta name="twitter:image" content="${esc(image)}">`,
  ].join("\n    ");

  let out = html;
  out = out.replace(/<meta[^>]*(property|name)="(og:[^"]+|twitter:[^"]+)"[^>]*>\s*/gi, "");
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
  if (/<meta\s+name="description"/i.test(out)) {
    out = out.replace(
      /<meta\s+name="description"[^>]*>/i,
      `<meta name="description" content="${esc(description)}">`
    );
  } else if (/<\/head>/i.test(out)) {
    out = out.replace(/<\/head>/i, `    <meta name="description" content="${esc(description)}">\n</head>`);
  }
  if (/<\/head>/i.test(out)) {
    out = out.replace(/<\/head>/i, `    ${block}\n</head>`);
  }
  return out;
}

async function fetchSiteConfig(slug) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/site/config`, {
      headers: { "X-Site-Id": slug, Accept: "application/json" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function serveHtmlAsset(context, assetPath) {
  const url = new URL(context.request.url);
  const assetRes = await context.env.ASSETS.fetch(new URL(assetPath, url.origin));
  if (!assetRes.ok) return assetRes;
  const html = await assetRes.text();
  const headers = new Headers(assetRes.headers);
  headers.set("content-type", "text/html; charset=utf-8");
  headers.delete("Location");
  return new Response(html, { status: 200, headers });
}

async function serveWeddingConvite(context, url, slug) {
  const assetRes = await context.env.ASSETS.fetch(new URL("/app/convite.html", url.origin));
  let html = await assetRes.text();

  const cfg = await fetchSiteConfig(slug);
  const hostSlug = CUSTOM_DOMAIN_SLUG[url.hostname.toLowerCase()];
  const pageUrl = hostSlug ? `${url.origin}/` : `${url.origin}/${slug}`;

  if (cfg) {
    const noiva = (cfg.nomeNoiva || "").trim();
    const noivo = (cfg.nomeNoivo || "").trim();
    const nomes = [noiva, noivo].filter(Boolean).join(" & ") || "Casamento";
    html = injectOg(html, {
      title: `${nomes} · Casamento`,
      description:
        cfg.ogDescricao ||
        `Convite de casamento de ${nomes}. Confirme presença e veja os detalhes.`,
      url: pageUrl,
      image:
        cfg.fotoHeroUrl ||
        cfg.fotoSecundariaUrl ||
        absUrl(url.origin, "app/imagens/og-image.jpg"),
    });
  } else if (slug === "sofiaelucas") {
    html = injectOg(html, {
      title: "Sofia & Lucas · Casamento",
      description: "Demonstração Loven — site de casamento com RSVP e lista de presentes.",
      url: pageUrl,
      image: absUrl(url.origin, "imagens/og-image.jpg"),
    });
  } else if (slug === "rafaekevin") {
    html = injectOg(html, {
      title: "Rafaella & Kevin · Casamento",
      description: "Com a bênção de Deus, convidamos você para o nosso casamento.",
      url: pageUrl,
      image: absUrl(url.origin, "app/imagens/og-image.jpg"),
    });
  } else {
    html = injectOg(html, {
      title: "Casamento · Loven",
      description: "Convite de casamento digital.",
      url: pageUrl,
      image: absUrl(url.origin, "app/imagens/og-image.jpg"),
    });
  }

  if (hostSlug && !/<base\s+href=/i.test(html)) {
    html = html.replace(/<head>/i, '<head>\n    <base href="/app/">');
  }

  const headers = new Headers(assetRes.headers);
  headers.set("content-type", "text/html; charset=utf-8");
  headers.set("cache-control", "public, max-age=0, must-revalidate");
  return new Response(html, { status: 200, headers });
}

async function handleWedding(context) {
  const url = new URL(context.request.url);
  const host = url.hostname.toLowerCase();
  const parts = url.pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  const hostSlug = CUSTOM_DOMAIN_SLUG[host];

  if (hostSlug) {
    const first = parts[0];
    if (
      !first ||
      (!first.includes(".") &&
        !WEDDING_RESERVED.has(first) &&
        /^[a-z0-9-]{3,40}$/.test(first))
    ) {
      return serveWeddingConvite(context, url, hostSlug);
    }
  }

  if (parts.length === 1) {
    const slug = parts[0].toLowerCase();
    if (!slug.includes(".") && !WEDDING_RESERVED.has(slug) && /^[a-z0-9-]{3,40}$/.test(slug)) {
      return serveWeddingConvite(context, url, slug);
    }
  }

  if (parts.length === 0) {
    return serveHtmlAsset(context, "/index.html");
  }

  if (parts[0] === "admin") {
    const rest = parts.slice(1).join("/");
    const assetPath = rest ? `/app/admin/${rest}` : "/app/admin/index.html";
    return context.env.ASSETS.fetch(new URL(assetPath + url.search, url.origin));
  }

  if (parts[0] === "app") {
    return context.env.ASSETS.fetch(context.request);
  }

  return context.env.ASSETS.fetch(context.request);
}

export async function onRequest(context) {
  return handleWedding(context);
}
