/**
 * Host routing:
 * - casamento.somosloven.com.br / rafaekevin.com.br → SaaS casamento (/casamento/*)
 * - somosloven.com.br → surpresas (raiz)
 */

const WEDDING_DOMAINS = new Set([
  "casamento.somosloven.com.br",
  "rafaekevin.com.br",
  "www.rafaekevin.com.br",
]);

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
  "casamento",
]);

const SURPRESA_PAGE_MAP = {
  criar: "/criar.html",
  login: "/login.html",
  pricing: "/pricing.html",
  conta: "/conta.html",
  pagar: "/pagar.html",
  "recuperar-senha": "/recuperar-senha.html",
  "redefinir-senha": "/redefinir-senha.html",
  historia: "/historia.html",
  privacidade: "/privacidade.html",
  termos: "/termos.html",
  cookies: "/cookies.html",
  amizade: "/amizade.html",
};

const SURPRESA_RESERVED = new Set([
  "",
  "index",
  "index.html",
  "criar",
  "criar.html",
  "login",
  "login.html",
  "pricing",
  "pricing.html",
  "historia",
  "historia.html",
  "conta",
  "conta.html",
  "pagar",
  "pagar.html",
  "recuperar-senha",
  "recuperar-senha.html",
  "redefinir-senha",
  "redefinir-senha.html",
  "amizade",
  "amizade.html",
  "privacidade",
  "privacidade.html",
  "termos",
  "termos.html",
  "cookies",
  "cookies.html",
  "css",
  "js",
  "assets",
  "api",
  "favicon.ico",
  "icon-share.png",
  "og.jpg",
  "apple-touch-icon.png",
  "site.webmanifest",
  "casamento",
]);

const API_BASE = "https://site-casamento-backend-nrfb.onrender.com";
const SURPRESA_API = "https://api.somosloven.com.br";
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

function injectBrandIcons(html, origin) {
  const icons = [
    `<link rel="icon" href="${origin}/assets/icons/favicon.svg" type="image/svg+xml">`,
    `<link rel="icon" href="${origin}/assets/icons/favicon-32.png" type="image/png" sizes="32x32">`,
    `<link rel="shortcut icon" href="${origin}/favicon.ico">`,
    `<link rel="apple-touch-icon" href="${origin}/icon-share.png">`,
    `<meta name="theme-color" content="#ed68ae">`,
  ].join("\n    ");

  let out = html;
  out = out.replace(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*>\s*/gi, "");
  out = out.replace(/<meta\s+name=["']theme-color["'][^>]*>\s*/gi, "");
  if (/<\/head>/i.test(out)) {
    out = out.replace(/<\/head>/i, `    ${icons}\n</head>`);
  }
  return out;
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

async function fetchSurpresaPublic(slug) {
  try {
    const res = await fetchWithTimeout(
      `${SURPRESA_API}/api/surprises/public/${encodeURIComponent(slug)}`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function serveSurpresaHistoria(context, slug) {
  const url = new URL(context.request.url);
  const origin = url.origin;
  const assetRes = await context.env.ASSETS.fetch(new URL("/historia.html", origin));
  if (!assetRes.ok) return assetRes;

  let html = await assetRes.text();
  const data = await fetchSurpresaPublic(slug);
  const pageUrl = `${origin}/${slug}`;
  const defaultImage = `${origin}/og.jpg`;

  let title = "Surpresa especial — Loven";
  let description = "Alguém preparou uma surpresa linda para você ♡ Abra o link.";
  let image = defaultImage;

  if (data) {
    const loved = String(data.lovedName || "").trim();
    const pageTitle = String(data.title || "").trim();
    const friendship = /amig|friend/i.test(String(data.intent || ""));
    const lovedIsGeneric = !loved || /^(você|voce|you)$/i.test(loved);
    title = pageTitle
      ? !lovedIsGeneric
        ? `${pageTitle} · Para ${loved}`
        : pageTitle
      : !lovedIsGeneric
        ? `Surpresa para ${loved}`
        : title;
    description = friendship
      ? !lovedIsGeneric
        ? `${loved}, alguém preparou uma surpresa de amizade especial para você ♡`
        : "Alguém preparou uma surpresa de amizade especial para você ♡"
      : !lovedIsGeneric
        ? `${loved}, alguém preparou uma surpresa de amor especial para você ♡`
        : "Alguém preparou uma surpresa de amor especial para você ♡";

    const photos = Array.isArray(data.photos) ? data.photos : [];
    const photo = photos.find((p) => /^https?:\/\//i.test(String(p || "")));
    // Foto do casal como preview quando existir; senão o card da marca
    if (photo) image = String(photo);
  }

  html = injectBrandIcons(html, origin);
  html = injectOg(html, { title, description, url: pageUrl, image });

  const headers = new Headers(assetRes.headers);
  headers.set("content-type", "text/html; charset=utf-8");
  headers.set("cache-control", "public, max-age=0, must-revalidate");
  headers.delete("Location");
  return new Response(html, { status: 200, headers });
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
  const assetRes = await context.env.ASSETS.fetch(
    new URL("/casamento/app/convite.html", url.origin)
  );
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
        absUrl(url.origin, "casamento/app/imagens/og-image.jpg"),
    });
  } else if (slug === "sofiaelucas") {
    html = injectOg(html, {
      title: "Sofia & Lucas · Casamento",
      description: "Demonstração Loven — site de casamento com RSVP e lista de presentes.",
      url: pageUrl,
      image: absUrl(url.origin, "casamento/imagens/og-image.jpg"),
    });
  } else if (slug === "rafaekevin") {
    html = injectOg(html, {
      title: "Rafaella & Kevin · Casamento",
      description: "Com a bênção de Deus, convidamos você para o nosso casamento.",
      url: pageUrl,
      image: absUrl(url.origin, "casamento/app/imagens/og-image.jpg"),
    });
  } else {
    html = injectOg(html, {
      title: "Casamento · Loven",
      description: "Convite de casamento digital.",
      url: pageUrl,
      image: absUrl(url.origin, "casamento/app/imagens/og-image.jpg"),
    });
  }

  // Assets do convite ficam em /casamento/app/ — ajusta paths relativos comuns
  html = html.replace(/(href|src)="\/(?!casamento\/)/g, '$1="/casamento/');
  html = html.replace(/(href|src)='\/(?!casamento\/)/g, "$1='/casamento/");

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
    return serveHtmlAsset(context, "/casamento/index.html");
  }

  // /admin → /casamento/app/admin (legado do _redirects)
  if (parts[0] === "admin") {
    const rest = parts.slice(1).join("/");
    const assetPath = rest
      ? `/casamento/app/admin/${rest}`
      : "/casamento/app/admin/index.html";
    return context.env.ASSETS.fetch(new URL(assetPath + url.search, url.origin));
  }

  // Já está em /casamento/... (CSS/JS/imagens do convite) — NÃO prefixar de novo
  // (senão vira /casamento/casamento/app/style.css e o CSS volta como HTML).
  if (parts[0] === "casamento") {
    return context.env.ASSETS.fetch(context.request);
  }

  // restante → /casamento{pathname}  (ex.: /landing.css → /casamento/landing.css)
  const assetPath = `/casamento${url.pathname}`.replace(/\/+/g, "/");
  const assetRes = await context.env.ASSETS.fetch(new URL(assetPath + url.search, url.origin));
  if (assetRes.status === 404 && /\.[a-z0-9]+$/i.test(parts[parts.length - 1] || "")) {
    // tenta path original antes de devolver HTML de fallback
    return context.env.ASSETS.fetch(context.request);
  }
  return assetRes;
}

async function handleSurpresa(context) {
  const url = new URL(context.request.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const first = (parts[0] || "").toLowerCase();

  if (parts.length === 0) return context.next();
  if (parts.length > 1 || first.includes(".")) return context.next();

  const mapped = SURPRESA_PAGE_MAP[first];
  if (mapped) return serveHtmlAsset(context, mapped);

  if (!SURPRESA_RESERVED.has(first)) {
    return serveSurpresaHistoria(context, first);
  }

  return context.next();
}

export async function onRequest(context) {
  const host = new URL(context.request.url).hostname.toLowerCase();
  if (WEDDING_DOMAINS.has(host) || host.startsWith("casamento.")) {
    return handleWedding(context);
  }
  return handleSurpresa(context);
}
