const RESERVED = new Set([
  "admin", "app", "imagens", "musicas", "landing", "api", "assets",
  "favicon.ico", "robots.txt", "sucesso.html", "index.html",
  "landing.css", "landing.js", "privacidade.html", "termos.html",
  "exclusao-de-conta.html"
]);

const API_BASE = "https://site-casamento-backend-nrfb.onrender.com";

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
  // Remove metas estáticas genéricas do HTML base (Rafa & Kevin / ids dinâmicos)
  out = out.replace(/<meta[^>]*(property|name)="(og:[^"]+|twitter:[^"]+)"[^>]*>\s*/gi, "");
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
  out = out.replace(
    /<meta\s+name="description"[^>]*>/i,
    `<meta name="description" content="${esc(description)}">`
  );
  if (/<\/head>/i.test(out)) {
    out = out.replace(/<\/head>/i, `    ${block}\n</head>`);
  }
  return out;
}

async function fetchSiteConfig(slug) {
  try {
    const res = await fetch(`${API_BASE}/api/site/config`, {
      headers: { "X-Site-Id": slug, Accept: "application/json" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const parts = url.pathname.replace(/\/+$/, "").split("/").filter(Boolean);

  if (parts.length === 1) {
    const slug = parts[0].toLowerCase();
    if (!slug.includes(".") && !RESERVED.has(slug) && /^[a-z0-9-]{3,40}$/.test(slug)) {
      const assetRes = await context.env.ASSETS.fetch(new URL("/app/convite.html", url.origin));
      let html = await assetRes.text();

      const cfg = await fetchSiteConfig(slug);
      if (cfg) {
        const noiva = (cfg.nomeNoiva || "").trim();
        const noivo = (cfg.nomeNoivo || "").trim();
        const nomes = [noiva, noivo].filter(Boolean).join(" & ") || "Casamento";
        const title = `${nomes} · Casamento`;
        const description =
          cfg.ogDescricao ||
          `Convite de casamento de ${nomes}. Confirme presença e veja os detalhes.`;
        const pageUrl = `${url.origin}/${slug}`;
        const image =
          cfg.fotoHeroUrl ||
          cfg.fotoSecundariaUrl ||
          absUrl(url.origin, "app/imagens/og-image.jpg");
        html = injectOg(html, { title, description, url: pageUrl, image });
      } else if (slug === "sofiaelucas") {
        html = injectOg(html, {
          title: "Sofia & Lucas · Casamento",
          description: "Demonstração Loven — site de casamento com RSVP e lista de presentes.",
          url: `${url.origin}/${slug}`,
          image: absUrl(url.origin, "imagens/og-image.jpg"),
        });
      } else {
        html = injectOg(html, {
          title: "Casamento · Loven",
          description: "Convite de casamento digital.",
          url: `${url.origin}/${slug}`,
          image: absUrl(url.origin, "app/imagens/og-image.jpg"),
        });
      }

      const headers = new Headers(assetRes.headers);
      headers.set("content-type", "text/html; charset=utf-8");
      headers.set("cache-control", "public, max-age=0, must-revalidate");
      return new Response(html, { status: 200, headers });
    }
  }

  return context.next();
}
