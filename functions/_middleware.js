const RESERVED = new Set([
  "admin", "app", "imagens", "musicas", "landing", "api", "assets",
  "favicon.ico", "robots.txt", "sucesso.html", "index.html",
  "landing.css", "landing.js"
]);

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const parts = url.pathname.replace(/\/+$/, "").split("/").filter(Boolean);

  if (parts.length === 1) {
    const slug = parts[0].toLowerCase();
    if (!slug.includes(".") && !RESERVED.has(slug) && /^[a-z0-9-]{3,40}$/.test(slug)) {
      const assetRes = await context.env.ASSETS.fetch(new URL("/app/convite.html", url.origin));
      const headers = new Headers(assetRes.headers);
      headers.set("content-type", "text/html; charset=utf-8");
      headers.set("cache-control", "public, max-age=0, must-revalidate");
      return new Response(assetRes.body, { status: 200, headers });
    }
  }

  return context.next();
}
