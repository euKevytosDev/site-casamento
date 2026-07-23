const hero = document.querySelector(".hero");
const site = document.querySelector(".site");
const btnAbrirConvite = document.getElementById("btn-abrir-convite");

const API_BASE = window.SITE_CONFIG?.apiBase || "https://site-casamento-backend-nrfb.onrender.com";

/** Slug do casamento: ?site=nicole-teste (painel) ou config.js padrão */
function resolverSiteId() {
    const params = new URLSearchParams(window.location.search);
    const q = (params.get("site") || params.get("siteId") || "").trim().toLowerCase();
    if (q) return q;
    return (window.SITE_CONFIG?.siteId || "rafaekevin").trim().toLowerCase();
}

let SITE_ID = resolverSiteId();
if (window.SITE_CONFIG) {
    window.SITE_CONFIG.siteId = SITE_ID;
}

// Helper: junta headers + X-Site-Id em todo fetch da API
function apiHeaders(extras = {}) {
    return {
        "X-Site-Id": SITE_ID,
        ...extras
    };
}

/** Escapa texto para uso seguro em HTML (previne XSS). */
function escapeHtml(valor) {
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

/** Só permite URLs http(s) ou caminhos relativos locais (imagens). */
function safeUrl(valor, fallback = "") {
    const raw = String(valor ?? "").trim();
    if (!raw) return fallback;
    const lower = raw.toLowerCase();
    if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("vbscript:")) {
        return fallback;
    }
    if (/^https?:\/\//i.test(raw) || raw.startsWith("/") || raw.startsWith("imagens/") || raw.startsWith("musicas/")) {
        return raw;
    }
    return fallback;
}

/** Fontes cursivas disponíveis para os nomes dos noivos (slug = id salvo no painel). */
const FONTES_NOMES = {
    "great-vibes": { family: "'Great Vibes', cursive" },
    "allura": { family: "'Allura', cursive" },
    "pinyon-script": { family: "'Pinyon Script', cursive" },
    "alex-brush": { family: "'Alex Brush', cursive" },
    "tangerine": { family: "'Tangerine', cursive" },
    "sacramento": { family: "'Sacramento', cursive" },
    "parisienne": { family: "'Parisienne', cursive" },
    "meie-script": { family: "'Meie Script', cursive" },
    "monsieur-la-doulaise": { family: "'Monsieur La Doulaise', cursive" },
    "bona-nova": { family: "'Bona Nova', serif" },
    "playfair-italic": { family: '"Playfair", serif' }
};

function aplicarFonteNomes(slug) {
    const id = FONTES_NOMES[slug] ? slug : "great-vibes";
    const fonte = FONTES_NOMES[id];
    document.documentElement.style.setProperty("--fonte-nomes", fonte.family);
    document.documentElement.dataset.fonteNomes = id;
}

// Lê o config e preenche a página (nomes, data, pais...)
function aplicarConfigDoSite() {
    const c = window.SITE_CONFIG;
    if (!c) return;

    const nomes = `${c.nomeNoiva} & ${c.nomeNoivo}`;

    const hero = document.getElementById("cfg-nomes-hero");
    if (hero) hero.textContent = nomes;

    const bloco = document.getElementById("cfg-nomes-bloco");
    if (bloco) {
        bloco.replaceChildren();
        bloco.append(document.createTextNode(c.nomeNoiva || ""));
        bloco.append(document.createElement("br"));
        bloco.append(document.createTextNode("&"));
        bloco.append(document.createElement("br"));
        bloco.append(document.createTextNode(c.nomeNoivo || ""));
    }

    const paisNoiva = document.getElementById("cfg-pais-noiva");
    if (paisNoiva) paisNoiva.textContent = c.paisNoiva || "";

    const paisNoivo = document.getElementById("cfg-pais-noivo");
    if (paisNoivo) paisNoivo.textContent = c.paisNoivo || "";

    const versiculoEl = document.getElementById("cfg-versiculo");
    if (versiculoEl && c.versiculo) versiculoEl.textContent = c.versiculo;

    const fraseBencaoEl = document.getElementById("cfg-frase-bencao");
    if (fraseBencaoEl && c.fraseBencao) fraseBencaoEl.textContent = c.fraseBencao;

    const tituloGaleriaEl = document.getElementById("cfg-titulo-galeria");
    if (tituloGaleriaEl) {
        tituloGaleriaEl.textContent = c.tituloGaleria || "Nossos momentos";
    }
    const historiaEl = document.getElementById("cfg-historia-curta");
    if (historiaEl) {
        const hist = (c.historiaCurta || "").trim();
        historiaEl.textContent = hist;
        historiaEl.hidden = !hist;
    }

    const dcTrajePadrao = "Esporte Fino";
    const dcTextoPadrao =
        "Pedimos um traje elegante e confortável para curtir a festa do início ao fim. Elas, vestidos ou conjuntos sociais; eles, calça, camisa e, se quiserem, blazer.";
    const dcCoresPadrao =
        "Com todo carinho, pedimos que evitem o off-white e o branco (exclusivo da noiva) e o verde oliva, que será a cor exclusiva do nosso cortejo de padrinhos.";
    const dcRodapePadrao = "O mais importante é a sua presença. Nos vemos lá!";
    const trajeEl = document.getElementById("cfg-dresscode-traje");
    if (trajeEl) trajeEl.textContent = (c.dresscodeTraje || "").trim() || dcTrajePadrao;
    const dcTextoEl = document.getElementById("cfg-dresscode-texto");
    if (dcTextoEl) dcTextoEl.textContent = (c.dresscodeTexto || "").trim() || dcTextoPadrao;
    const coresDc = (c.dresscodeCores != null ? c.dresscodeCores : dcCoresPadrao).trim();
    const blocoCores = document.getElementById("cfg-dresscode-bloco-cores");
    if (blocoCores) blocoCores.hidden = !coresDc;
    const coresEl = document.getElementById("cfg-dresscode-cores");
    if (coresEl) coresEl.textContent = coresDc;
    const rodapeEl = document.getElementById("cfg-dresscode-rodape");
    if (rodapeEl) rodapeEl.textContent = (c.dresscodeRodape || "").trim() || dcRodapePadrao;

    // dataCasamento = "2027-04-24" → ano, mês, dia
    const partes = (c.dataCasamento || "").split("-"); // [ano, mes, dia]
    if (partes.length === 3) {
        const diaEl = document.getElementById("cfg-dia");
        const anoEl = document.getElementById("cfg-ano");
        if (diaEl) diaEl.textContent = String(Number(partes[2])); // 24 (sem zero à esquerda)
        if (anoEl) anoEl.textContent = partes[0];
    }

    const mesEl = document.getElementById("cfg-mes");
    if (mesEl) mesEl.textContent = c.mesExtenso || "";

    const semanaEl = document.getElementById("cfg-dia-semana");
    if (semanaEl) semanaEl.textContent = c.diaSemana || "";

    const horaEl = document.getElementById("cfg-hora");
    if (horaEl) horaEl.textContent = (c.horaCasamento || "") + "H";

    // Título da aba + data legível (meta / painel do local)
    const curto = c.nomeCurto || nomes;
    let tituloAba = nomes;
    let dataLegivel = "";
    if (partes.length === 3) {
        tituloAba = `${nomes} · ${partes[2]}.${partes[1]}.${partes[0]}`;
        const meses = ["", "janeiro", "fevereiro", "março", "abril", "maio", "junho",
            "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
        const mesNum = Number(partes[1]);
        dataLegivel = `${Number(partes[2])} de ${meses[mesNum] || partes[1]} de ${partes[0]}`;
    }
    document.title = tituloAba;

    // Local + Maps
    const localEl = document.getElementById("cfg-local");
    const mapsUrl = c.mapsUrl ? safeUrl(c.mapsUrl) : "";
    const mapsUrlFesta = c.mapsUrlFesta ? safeUrl(c.mapsUrlFesta) : "";
    const mesmoLocal = c.mesmoLocal !== false;

    if (localEl) {
        if (mesmoLocal) {
            localEl.textContent = c.localNome || "Local do casamento";
        } else {
            localEl.textContent = "Cerimônia e festa";
        }
    }

    const nomeCerFoto = document.getElementById("cfg-foto-nome-cerimonia");
    if (nomeCerFoto) nomeCerFoto.textContent = c.localNome || "Local da cerimônia";
    const nomeFesFoto = document.getElementById("cfg-foto-nome-festa");
    if (nomeFesFoto) nomeFesFoto.textContent = c.localNomeFesta || "Local da festa";

    const cenaLocal = document.getElementById("local-cena");
    const containerLocal = document.querySelector(".container-local");
    const fotoFestaEl = document.querySelector(".local-foto--festa");
    if (cenaLocal) {
        cenaLocal.dataset.doisLocais = mesmoLocal ? "false" : "true";
    }
    if (containerLocal) {
        containerLocal.dataset.doisLocais = mesmoLocal ? "false" : "true";
    }
    if (fotoFestaEl) {
        fotoFestaEl.hidden = mesmoLocal;
    }

    const mapsEl = document.getElementById("cfg-maps");
    if (mapsEl && mapsUrl) {
        mapsEl.setAttribute("href", mapsUrl);
    }
    const mapsLocalEl = document.getElementById("cfg-maps-local");
    if (mapsLocalEl && mapsUrl) {
        mapsLocalEl.setAttribute("href", mapsUrl);
    }

    const mapsCerimonia = document.getElementById("cfg-maps-cerimonia");
    if (mapsCerimonia) {
        if (mapsUrl) mapsCerimonia.setAttribute("href", mapsUrl);
        const nomeCer = document.getElementById("cfg-maps-nome-cerimonia");
        if (nomeCer) nomeCer.textContent = c.localNome || "Local da cerimônia";
    }
    const mapsFesta = document.getElementById("cfg-maps-festa");
    if (mapsFesta) {
        if (mapsUrlFesta) mapsFesta.setAttribute("href", mapsUrlFesta);
        const nomeFes = document.getElementById("cfg-maps-nome-festa");
        if (nomeFes) nomeFes.textContent = c.localNomeFesta || "Local da festa";
    }

    const painelTexto = document.getElementById("cfg-local-painel-texto")
        || document.querySelector(".local-painel-texto");
    if (painelTexto) {
        if (mesmoLocal) {
            painelTexto.classList.remove("local-painel-texto--dois");
            painelTexto.textContent = "Será uma alegria receber você neste dia especial.";
        } else {
            painelTexto.classList.add("local-painel-texto--dois");
            const cer = escapeHtml(c.localNome || "—");
            const fes = escapeHtml(c.localNomeFesta || "—");
            painelTexto.innerHTML =
                `<span class="local-painel-endereco"><em>Cerimônia</em> ${cer}</span>` +
                `<span class="local-painel-endereco"><em>Festa</em> ${fes}</span>`;
        }
    }

    const painelEyebrow = document.querySelector(".local-painel-eyebrow");
    if (painelEyebrow) {
        painelEyebrow.textContent = mesmoLocal ? "Cerimônia e recepção" : "Dois endereços";
    }

    document.documentElement.dataset.mesmoLocal = mesmoLocal ? "true" : "false";

    const localQuando = document.getElementById("cfg-local-quando");
    if (localQuando) {
        const diaSem = (c.diaSemana || "").trim();
        const partesQuando = [];
        if (diaSem) partesQuando.push(diaSem.charAt(0) + diaSem.slice(1).toLowerCase());
        if (dataLegivel) partesQuando.push(dataLegivel);
        if (partesQuando.length) localQuando.textContent = partesQuando.join(" · ");
    }
    const localHora = document.getElementById("cfg-local-hora");
    if (localHora && c.horaCasamento) {
        localHora.textContent = c.horaCasamento;
    }

    const descricaoPadrao = dataLegivel
        ? `Convite de casamento de ${nomes} — ${dataLegivel}.`
        : `Convite de casamento de ${nomes}.`;
    const descricaoOg = c.ogDescricao || descricaoPadrao;
    const baseUrl = (c.siteUrl || "").replace(/\/?$/, "/");
    const ogImagePath = (c.ogImagem || "imagens/og-image.jpg").replace(/^\//, "");
    const ogImageUrl = baseUrl ? baseUrl + ogImagePath : ogImagePath;

    const setMeta = (id, value) => {
        const el = document.getElementById(id);
        if (el && value) el.setAttribute("content", value);
    };
    setMeta("meta-description", descricaoPadrao);
    setMeta("meta-app-name", curto);
    setMeta("meta-apple-title", curto);
    setMeta("og-title", tituloAba);
    setMeta("og-description", descricaoOg);
    setMeta("og-url", baseUrl);
    setMeta("og-image", ogImageUrl);
    setMeta("twitter-image", ogImageUrl);

    aplicarMusicaDoConfig();

    // Aplica cores do config nas variáveis CSS (sem mudar o visual se forem as mesmas)
    if (c.cores) {
        const root = document.documentElement.style;
        const map = {
            verde: "--cor-verde",
            verdeEscuro: "--cor-verde-escuro",
            verdeClaro: "--cor-verde-claro",
            fundo: "--cor-fundo",
            fundoBege: "--cor-fundo-bege",
            texto: "--cor-texto",
            textoHero: "--cor-texto-hero"
        };
        Object.entries(map).forEach(([chave, cssVar]) => {
            if (c.cores[chave]) root.setProperty(cssVar, c.cores[chave]);
        });
    }

    aplicarFonteNomes(c.fonteNomes);

    aplicarFotosDoSite(c);
    atualizarOpcaoCartaoPresente(c);
}

function atualizarOpcaoCartaoPresente(c) {
    const ok = !!(c && c.mpCartaoDisponivel);
    const btn = document.getElementById("btn-pagar-cartao");
    const dica = document.getElementById("dica-cartao-presente");
    if (btn) btn.classList.toggle("escondido", !ok);
    if (dica) dica.classList.toggle("escondido", !ok);
}

/** Slug da vitrine de venda (com fotos reais). Qualquer outro slug usa layout neutro. */
const SITE_VITRINE = "rafaekevin";

function ehSiteVitrine() {
    return SITE_ID === SITE_VITRINE;
}

function aplicarFotoLocalImg(img, wrap, url, placeholderTexto, vitrine) {
    if (!img) return;
    if (url) {
        img.src = url;
        img.style.display = "";
        img.classList.remove("foto-vazia-img");
        wrap?.querySelector(".placeholder-foto")?.remove();
    } else if (!vitrine) {
        img.removeAttribute("src");
        img.style.display = "none";
        if (wrap && !wrap.querySelector(".placeholder-foto")) {
            const ph = document.createElement("div");
            ph.className = "placeholder-foto";
            ph.textContent = placeholderTexto;
            wrap.insertBefore(ph, img);
        }
    }
}

/** Aplica URLs de fotos da API. Fora da vitrine, sem URL = placeholder (nunca herda foto do Rafa). */
function aplicarFotosDoSite(c) {
    if (!c) return;
    const vitrine = ehSiteVitrine();

    const heroEl = document.querySelector(".hero");
    if (heroEl) {
        if (c.fotoHeroUrl) {
            heroEl.style.backgroundImage = `url("${c.fotoHeroUrl}")`;
            heroEl.classList.remove("foto-vazia");
        } else if (!vitrine) {
            heroEl.style.backgroundImage = "none";
            heroEl.classList.add("foto-vazia");
        }
    }

    const foto2 = document.querySelector(".foto2");
    if (foto2) {
        if (c.fotoSecundariaUrl) {
            foto2.style.backgroundImage = `url("${c.fotoSecundariaUrl}")`;
            foto2.classList.remove("foto-vazia");
        } else if (!vitrine) {
            foto2.style.backgroundImage = "none";
            foto2.classList.add("foto-vazia");
        }
    }

    const imgLocal = document.getElementById("cfg-foto-local")
        || document.querySelector(".local-foto[data-local='cerimonia'] .espaco-foto-wrapper img");
    const wrapLocal = imgLocal?.closest(".espaco-foto-wrapper");
    aplicarFotoLocalImg(imgLocal, wrapLocal, c.fotoLocalUrl, "Foto do local", vitrine);

    const imgLocalFesta = document.getElementById("cfg-foto-local-festa");
    const wrapLocalFesta = imgLocalFesta?.closest(".espaco-foto-wrapper");
    if (c.mesmoLocal === false) {
        aplicarFotoLocalImg(imgLocalFesta, wrapLocalFesta, c.fotoLocalFestaUrl, "Foto da festa", vitrine);
    }

    const imgRodape = document.getElementById("cfg-foto-rodape")
        || document.querySelector(".fotomeio");
    if (imgRodape) {
        if (c.fotoRodapeUrl) {
            imgRodape.src = c.fotoRodapeUrl;
            imgRodape.style.display = "";
            imgRodape.classList.remove("foto-vazia-img");
        } else if (!vitrine) {
            imgRodape.removeAttribute("src");
            imgRodape.alt = "Espaço para foto";
            imgRodape.classList.add("foto-vazia-img");
        }
    }

    const fotos = Array.isArray(c.fotosCarrossel) ? c.fotosCarrossel.filter(Boolean) : [];
    const slidesWrap = document.querySelector("#carrossel-momentos .carrossel-slides");
    const dotsWrap = document.querySelector("#carrossel-momentos .carrossel-dots");
    if (!slidesWrap) return;

    if (fotos.length) {
        slidesWrap.innerHTML = fotos.map((url, i) => {
            const src = escapeHtml(safeUrl(url, "imagens/flor-central2.png"));
            return `
            <figure class="carrossel-slide${i === 0 ? " ativo" : ""}">
                <img src="${src}" alt="Momento ${i + 1}">
            </figure>
        `;
        }).join("");
        if (dotsWrap) dotsWrap.innerHTML = "";
        if (typeof iniciarCarrosselMomentos === "function") {
            iniciarCarrosselMomentos();
        }
    } else if (!vitrine) {
        slidesWrap.innerHTML = `
            <figure class="carrossel-slide ativo">
                <div class="placeholder-foto placeholder-foto--carrossel">Suas fotos aqui</div>
            </figure>
        `;
        if (dotsWrap) dotsWrap.innerHTML = "";
    }
}

/**
 * Busca personalização no backend e mescla em SITE_CONFIG.
 * Se a API falhar (cold start), mantém o config.js local.
 */
async function carregarConfigRemota() {
    try {
        const res = await fetch(`${API_BASE}/api/site/config`, {
            headers: apiHeaders()
        });
        if (!res.ok) return false;
        const remoto = await res.json();
        window.SITE_CONFIG = {
            ...(window.SITE_CONFIG || {}),
            ...Object.fromEntries(
                Object.entries(remoto).filter(([, v]) => v !== null && v !== undefined && v !== "")
            ),
            cores: {
                ...((window.SITE_CONFIG && window.SITE_CONFIG.cores) || {}),
                ...(remoto.cores || {})
            },
            siteId: remoto.siteId || SITE_ID
        };
        if (remoto.siteId) {
            SITE_ID = remoto.siteId;
        }
        aplicarConfigDoSite();
        return true;
    } catch (_) {
        return false;
    }
}

const SITE_VIA_URL = (() => {
    const params = new URLSearchParams(window.location.search);
    return !!(params.get("site") || params.get("siteId") || "").trim();
})();

/** Qualquer casal que não seja a vitrine: não pinta Rafa/Kevin antes da API. */
const USAR_LAYOUT_NEUTRO = SITE_VIA_URL && !ehSiteVitrine();

if (USAR_LAYOUT_NEUTRO) {
    carregarConfigRemota().then((ok) => {
        if (ok) document.documentElement.classList.remove("site-via-url");
    });
} else {
    aplicarConfigDoSite();
    carregarConfigRemota();
}

/* Laterais decorativas: altura = documento inteiro (rola com o site) */
function ajustarAlturaLaterais() {
    const camada = document.querySelector(".laterais-decor");
    if (!camada) return;
    const altura = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        window.innerHeight
    );
    camada.style.height = altura + "px";
    camada.style.bottom = "auto";
}

window.addEventListener("load", ajustarAlturaLaterais);
window.addEventListener("resize", ajustarAlturaLaterais);

/* =======================================================
   TOAST (substitui alert)
   ======================================================= */
function toast(mensagem, tipo = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }

    const el = document.createElement("div");
    el.className = `toast toast-${tipo}`;
    el.textContent = mensagem;
    container.appendChild(el);

    requestAnimationFrame(() => el.classList.add("visivel"));

    setTimeout(() => {
        el.classList.remove("visivel");
        setTimeout(() => el.remove(), 300);
    }, 3200);
}

/* Mantém a barra do Chrome/Android branca ao rolar (não herda verde/bege da página) */
(function fixarBarraNavegadorBranca() {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
        meta = document.createElement("meta");
        meta.name = "theme-color";
        document.head.appendChild(meta);
    }

    const branco = "#ffffff";

    function aplicar() {
        meta.setAttribute("content", branco);
    }

    aplicar();
    window.addEventListener("scroll", aplicar, { passive: true });
    window.addEventListener("resize", aplicar, { passive: true });
    document.addEventListener("visibilitychange", aplicar);
})();

/** Blessings tem trecho específico; outras músicas tocam do início. */
function configMusicaAtual() {
    const el = document.getElementById("musica");
    if (!el) return { inicio: 0, loopEm: 0 };
    const src = (el.querySelector("source")?.getAttribute("src")
        || el.currentSrc
        || window.SITE_CONFIG?.musicaUrl
        || "").toLowerCase();
    const isBlessings = src.includes("blessings");
    return {
        inicio: isBlessings ? 70 : 0,
        loopEm: isBlessings ? 99 : 0
    };
}

function aplicarMusicaDoConfig() {
    const el = document.getElementById("musica");
    const url = window.SITE_CONFIG?.musicaUrl;
    if (!url || !el) return;
    const source = el.querySelector("source");
    const atual = source?.getAttribute("src") || "";
    if (atual === url) return;
    if (source) source.setAttribute("src", url);
    else {
        const s = document.createElement("source");
        s.src = url;
        s.type = "audio/mpeg";
        el.appendChild(s);
    }
    el.load();
}

const musica = document.getElementById("musica");
if (musica) {
    musica.volume = 0.4;
    musica.loop = false;
}

btnAbrirConvite.addEventListener("click", () => {
    aplicarMusicaDoConfig();
    const cfgMusica = configMusicaAtual();
    if (musica) {
        musica.currentTime = cfgMusica.inicio;
        musica.play();
    }

    // 🚀 GATILHO SILENCIOSO: Acorda a Render em segundo plano assim que entra no site!
    // Como não colocamos o ".then", o JS só faz a chamada e continua rodando o resto do site sem travar nada.
    fetch(`${API_BASE}/api/health`, {
        headers: apiHeaders()
    })
        .then(() => console.log("Servidor alertado com sucesso nos bastidores! ⏰"))
        .catch(() => console.log("Servidor já deve estar acordado ou processando."));

    hero.style.opacity = "0";

    setTimeout(() => {
        hero.style.display = "none";

        // mostra o site
        site.style.display = "block";
        ajustarAlturaLaterais();

        // pequeno delay pra ativar o fade in
        setTimeout(() => {
            site.style.opacity = "1";
        }, 50);

    }, 800); // tempo igual ao CSS
});

/* Feedback de aperto no selo (melhor no toque do celular) */
if (btnAbrirConvite) {
    const pressOn = () => btnAbrirConvite.classList.add("selo-pressionado");
    const pressOff = () => btnAbrirConvite.classList.remove("selo-pressionado");
    btnAbrirConvite.addEventListener("pointerdown", pressOn);
    btnAbrirConvite.addEventListener("pointerup", pressOff);
    btnAbrirConvite.addEventListener("pointercancel", pressOff);
    btnAbrirConvite.addEventListener("pointerleave", pressOff);
}

// EVENTO DE LOOP
if (musica) {
    musica.addEventListener("ended", () => {
        const cfgMusica = configMusicaAtual();
        musica.currentTime = cfgMusica.loopEm;
        musica.play();
    });
}

const versiculo = document.querySelector(".versiculo");
const indicadorScroll = document.getElementById("indicador-scroll");
let indicadorScrollOculto = false;

function ocultarIndicadorScroll() {
    if (indicadorScrollOculto || !indicadorScroll) return;
    indicadorScrollOculto = true;
    indicadorScroll.classList.add("oculto");
}

window.addEventListener("scroll", () => {

    if (window.scrollY > 40) {
        ocultarIndicadorScroll();
    }

    const posicao = versiculo.getBoundingClientRect().top; /* posição do elemento */
    const alturaTela = window.innerHeight; /* altura da tela */

    if (posicao < alturaTela - 50) { /* quando entra na tela */
        versiculo.classList.add("ativo"); /* ativa animação */
    }

}, { passive: true });

// Animação suave ao rolar até seções marcadas com .revelar-scroll
const elementosRevelar = document.querySelectorAll(".revelar-scroll");

if (elementosRevelar.length > 0) {
    const observadorScroll = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add("visivel");
                observadorScroll.unobserve(entrada.target);
            }
        });
    }, { threshold: 0.15 });

    elementosRevelar.forEach((el) => observadorScroll.observe(el));
}

/** Carrossel "Nossos momentos": fade + autoplay + swipe + setas */
function iniciarCarrosselMomentos() {
    const root = document.getElementById("carrossel-momentos");
    if (!root) return;

    if (typeof root._carrosselCleanup === "function") {
        root._carrosselCleanup();
        root._carrosselCleanup = null;
    }

    const slides = Array.from(root.querySelectorAll(".carrossel-slide"));
    const dotsWrap = root.querySelector(".carrossel-dots");
    const contadorEl = root.querySelector(".carrossel-contador") || document.getElementById("carrossel-contador");
    const btnPrev = root.querySelector(".carrossel-nav--prev");
    const btnNext = root.querySelector(".carrossel-nav--next");
    if (!dotsWrap) return;
    dotsWrap.innerHTML = "";
    if (slides.length < 1) return;

    function atualizarContador(i) {
        if (!contadorEl) return;
        const atual = String(i + 1).padStart(2, "0");
        const total = String(slides.length).padStart(2, "0");
        contadorEl.textContent = `${atual} / ${total}`;
    }

    if (slides.length === 1) {
        slides[0].classList.add("ativo");
        atualizarContador(0);
        if (btnPrev) btnPrev.hidden = true;
        if (btnNext) btnNext.hidden = true;
        return;
    }

    const intervaloMs = Number(root.dataset.intervalo) || 3360;
    const reduzirMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let indice = slides.findIndex((s) => s.classList.contains("ativo"));
    if (indice < 0) indice = 0;
    slides.forEach((s, i) => s.classList.toggle("ativo", i === indice));
    atualizarContador(indice);

    slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carrossel-dot" + (i === indice ? " ativo" : "");
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", `Foto ${i + 1}`);
        dot.addEventListener("click", () => irPara(i, true));
        dotsWrap.appendChild(dot);
    });

    const dots = Array.from(dotsWrap.querySelectorAll(".carrossel-dot"));

    function irPara(novo, reiniciarTimer) {
        if (novo === indice) return;
        slides[indice].classList.remove("ativo");
        dots[indice].classList.remove("ativo");
        indice = (novo + slides.length) % slides.length;
        slides[indice].classList.add("ativo");
        dots[indice].classList.add("ativo");
        atualizarContador(indice);
        if (reiniciarTimer) reiniciar();
    }

    let timer = null;
    function parar() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }
    function reiniciar() {
        parar();
        if (reduzirMotion) return;
        timer = setInterval(() => irPara(indice + 1, false), intervaloMs);
    }

    const onPrev = () => irPara(indice - 1, true);
    const onNext = () => irPara(indice + 1, true);
    btnPrev?.addEventListener("click", onPrev);
    btnNext?.addEventListener("click", onNext);

    let toqueX = null;
    const viewport = root.querySelector(".carrossel-viewport");
    const onTouchStart = (e) => {
        toqueX = e.changedTouches[0].clientX;
        parar();
    };
    const onTouchEnd = (e) => {
        if (toqueX == null) return;
        const delta = e.changedTouches[0].clientX - toqueX;
        toqueX = null;
        if (Math.abs(delta) > 40) {
            irPara(indice + (delta < 0 ? 1 : -1), true);
        } else {
            reiniciar();
        }
    };
    if (viewport) {
        viewport.addEventListener("touchstart", onTouchStart, { passive: true });
        viewport.addEventListener("touchend", onTouchEnd, { passive: true });
    }

    const onEnter = () => parar();
    const onLeave = () => reiniciar();
    root.addEventListener("mouseenter", onEnter);
    root.addEventListener("mouseleave", onLeave);

    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (entrada.isIntersecting) reiniciar();
            else parar();
        });
    }, { threshold: 0.35 });
    observador.observe(root);

    root._carrosselCleanup = () => {
        parar();
        observador.disconnect();
        root.removeEventListener("mouseenter", onEnter);
        root.removeEventListener("mouseleave", onLeave);
        btnPrev?.removeEventListener("click", onPrev);
        btnNext?.removeEventListener("click", onNext);
        if (viewport) {
            viewport.removeEventListener("touchstart", onTouchStart);
            viewport.removeEventListener("touchend", onTouchEnd);
        }
        dotsWrap.innerHTML = "";
    };
}

iniciarCarrosselMomentos();

const DURACAO_MODAL_MS = 280;

function abrirModal(modalEl) {
    if (!modalEl) return;
    modalEl.style.display = "flex";
    requestAnimationFrame(() => modalEl.classList.add("modal-aberto"));
}

function fecharModal(modalEl) {
    if (!modalEl) return;
    if (!modalEl.classList.contains("modal-aberto")) {
        modalEl.style.display = "none";
        return;
    }
    modalEl.classList.remove("modal-aberto");
    window.setTimeout(() => {
        if (!modalEl.classList.contains("modal-aberto")) {
            modalEl.style.display = "none";
        }
    }, DURACAO_MODAL_MS);
}

function locaisSeparados() {
    const c = window.SITE_CONFIG || {};
    if (c.mesmoLocal !== false) return false;
    const festaHref = document.getElementById("cfg-maps-festa")?.getAttribute("href") || c.mapsUrlFesta || "";
    return !!(festaHref && festaHref !== "#");
}

function abrirEscolhaMapa(evento) {
    if (!locaisSeparados()) return;
    evento.preventDefault();
    abrirModal(document.getElementById("modal-mapas"));
}

document.querySelectorAll(".js-abrir-mapa").forEach((el) => {
    el.addEventListener("click", abrirEscolhaMapa);
});

const modalMapas = document.getElementById("modal-mapas");
document.getElementById("fechar-modal-mapas")?.addEventListener("click", () => fecharModal(modalMapas));
modalMapas?.addEventListener("click", (evento) => {
    if (evento.target === modalMapas) fecharModal(modalMapas);
});
modalMapas?.querySelectorAll(".mapa-escolha").forEach((a) => {
    a.addEventListener("click", () => fecharModal(modalMapas));
});

function atualizarContador() {
    const dataIso = window.SITE_CONFIG?.dataCasamento || "2027-04-24";
    const dataCasamento = new Date(dataIso + "T00:00:00").getTime();
    const agora = new Date().getTime();
    const diferenca = dataCasamento - agora;



    // Cálculos de tempo
    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

    // Exibindo no HTML (Garante os dois dígitos "00")
    document.getElementById("dias").innerText = dias < 10 ? "0" + dias : dias;
    document.getElementById("horas").innerText = horas < 10 ? "0" + horas : horas;
    document.getElementById("minutos").innerText = minutos < 10 ? "0" + minutos : minutos;
    document.getElementById("segundos").innerText = segundos < 10 ? "0" + segundos : segundos;

    // Se o tempo acabar
    if (diferenca < 0) {
        clearInterval(intervalo);
        document.querySelector(".regressiva").innerHTML = "<p>É hoje! ✨</p>";
    }
}

// Atualiza a cada 1 segundo
const intervalo = setInterval(atualizarContador, 1000);
atualizarContador();

/* =======================================================
   LÓGICA DO MODAL DE CONFIRMAÇÃO DE PRESENÇA
   ======================================================= */

// SELEÇÃO DE ELEMENTOS: Dizemos para o JS quem é quem no HTML usando o ID
const botaoPresenca = document.getElementById("btn-presenca"); // Captura o botão verde redondo de presença
const modalPresenca = document.getElementById("modal-presenca"); // Captura a camada escura de fundo do modal
const botaoFechar = document.getElementById("fechar-modal"); // Captura o botão "X" de fechar dentro do modal
const formulario = document.getElementById("form-presenca"); // Captura o formulário de dentro do modal

// FUNÇÃO PARA ABRIR O MODAL
botaoPresenca.addEventListener("click", () => {
    abrirModal(modalPresenca);
    atualizarInterfaceLista();
});

// FUNÇÃO PARA FECHAR O MODAL CLICANDO NO X
botaoFechar.addEventListener("click", () => {
    fecharModal(modalPresenca);
});

// FUNÇÃO PARA FECHAR O MODAL CLICANDO FORA DA CAIXA BRANCA
window.addEventListener("click", (evento) => {
    // Se o clique do usuário aconteceu na cortina escura e não na caixinha branca de dentro...
    if (evento.target === modalPresenca) {
        fecharModal(modalPresenca);
    }
});

/*LÓGICA EVOLUÍDA DO FORMULÁRIO DINÂMICO DE FAMÍLIA*/

// 1. CAPTURA DOS NOVOS ELEMENTOS DO HTML
const btnAdicionarMembro = document.getElementById("btn-adicionar-membro");
const btnEnviarFamilia = document.getElementById("btn-enviar-familia");
const listaFamiliaVisual = document.getElementById("lista-familia-visual");

const campoNome = document.getElementById("nome-convidado");
const campoIdade = document.getElementById("idade-convidado");

// 2. A NOSSA BANDEJA (O ARRAY NA MEMÓRIA)
// É aqui que os familiares vão ficar guardados temporariamente antes de irem pro Spring Boot
let listaFamilia = [];

// 3. FUNÇÃO QUE ATUALIZA A TELA (IMPRIME OS NOMES NA CAIXINHA)
function atualizarInterfaceLista() {
    // Limpa a lista visual para não duplicar os nomes antigos
    listaFamiliaVisual.innerHTML = "";

    // Se a lista estiver vazia, recoloca o aviso cinza e bloqueia o botão final
    if (listaFamilia.length === 0) {
        listaFamiliaVisual.innerHTML = `<p class="lista-vazia-aviso">Nenhum membro adicionado ainda</p>`;
        btnEnviarFamilia.disabled = true;
        return;
    }

    // Se tiver gente na lista, libera o botão de confirmar a família inteira
    btnEnviarFamilia.disabled = false;

    // Roda cada membro da nossa memória e desenha ele na tela com um botão de "X" para remover
    listaFamilia.forEach((membro, index) => {
        const li = document.createElement("li");
        const span = document.createElement("span");
        const strong = document.createElement("strong");
        strong.textContent = membro.nomeConvidado;
        span.append(strong);
        span.append(document.createTextNode(
            ` (${membro.idade} anos) - ${membro.confirmado ? "Confirmado" : "Não vai"}`
        ));
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn-remover-membro";
        btn.setAttribute("aria-label", "Remover");
        btn.textContent = "×";
        btn.addEventListener("click", () => window.removerMembroDaLista(index));
        li.append(span, btn);
        listaFamiliaVisual.appendChild(li);
    });
}

// ============================================================================
// 4. AÇÃO DO BOTÃO "➕ ADICIONAR À LISTA" (ATUALIZADO PARA CASAR COM O MODEL)
// ============================================================================
btnAdicionarMembro.addEventListener("click", () => {
    if (!campoNome.value || !campoIdade.value) {
        toast("Preencha o Nome e a Idade antes de adicionar.", "erro");
        return;
    }

    const radioStatus = document.querySelector('input[name="status-presenca"]:checked').value;
    const estaConfirmado = radioStatus === "sim";

    const novoMembro = {
        nomeConvidado: campoNome.value,
        idade: parseInt(campoIdade.value),
        confirmado: estaConfirmado
    };

    listaFamilia.push(novoMembro);
    atualizarInterfaceLista();

    // Limpa os campos para o próximo
    campoNome.value = "";
    campoIdade.value = "";
    document.querySelector('input[name="status-presenca"][value="sim"]').checked = true;
});

// 5. FUNÇÃO PARA REMOVER ALGUÉM CASO O USUÁRIO DIGITE ERRADO
// Usamos o 'window.' para garantir que o HTML encontre a função pelo 'onclick'
window.removerMembroDaLista = function (index) {
    listaFamilia.splice(index, 1); // Remove o elemento da memória usando a posição dele (index)
    atualizarInterfaceLista(); // Atualiza a tela instantaneamente
};

// 6. AÇÃO DO BOTÃO FINAL "🚀 CONFIRMAR FAMÍLIA INTEIRA" (COM SPINNER DE CARREGAMENTO)
btnEnviarFamilia.addEventListener("click", () => {

    // Captura os elementos do spinner e do texto de dentro do botão
    const spinner = document.getElementById("spinner");
    const btnTexto = document.getElementById("btn-texto");

    // 1. ATIVA O MODO CARREGANDO: Mostra o spinner, muda o texto e desativa o botão para evitar cliques duplos
    spinner.classList.remove("escondido");
    btnTexto.innerText = "Confirmando presença, aguarde...";
    btnEnviarFamilia.disabled = true;

    console.log("Enviando para o Spring Boot:", listaFamilia);

    fetch(`${API_BASE}/api/presenca/confirmar-familia`, {
        method: "POST",
        headers: apiHeaders({
            "Content-Type": "application/json"
        }),
        body: JSON.stringify(listaFamilia)
    })
        .then(resposta => {
            if (resposta.ok) {
                toast("Presença confirmada com sucesso! Muito obrigado. ✨", "sucesso");
                listaFamilia = [];
                atualizarInterfaceLista();
                fecharModal(modalPresenca);
            } else {
                toast("Ops! Erro ao enviar os dados. Tente novamente.", "erro");
            }
        })
        .catch(erro => {
            console.error("Erro de conexão:", erro);
            toast("Não foi possível conectar ao servidor. Tente novamente em instantes.", "erro");
        })
        .finally(() => {
            spinner.classList.add("escondido");
            btnTexto.innerText = "Confirmar Pessoa(s)!";
            btnEnviarFamilia.disabled = listaFamilia.length === 0;
        });
});

/* =======================================================
   LÓGICA DO MODAL DE PRESENTES
   ======================================================= */

const botaoPresentes = document.getElementById("btn-presentes");
const modalPresentes = document.getElementById("modal-presentes");
const botaoFecharPresentes = document.getElementById("fechar-modal-presentes");
const listaPresentes = document.getElementById("lista-presentes");
const loadingPresentes = document.getElementById("loading-presentes");
const painelCarrinho = document.getElementById("painel-carrinho");
const listaCarrinho = document.getElementById("lista-carrinho");
const totalCarrinhoEl = document.getElementById("total-carrinho");
const campoNomeComprador = document.getElementById("nome-comprador");
const btnLimparCarrinho = document.getElementById("btn-limpar-carrinho");
const btnFinalizarCarrinho = document.getElementById("btn-finalizar-carrinho");
const spinnerCompra = document.getElementById("spinner-compra");
const textoFinalizarCarrinho = document.getElementById("texto-finalizar-carrinho");
const btnPagarCartao = document.getElementById("btn-pagar-cartao");
const spinnerCartao = document.getElementById("spinner-cartao");
const textoPagarCartao = document.getElementById("texto-pagar-cartao");
const dicaCartaoPresente = document.getElementById("dica-cartao-presente");
const painelPix = document.getElementById("painel-pix");
const totalPixEl = document.getElementById("total-pix");
const canvasQrPix = document.getElementById("qrcode-pix");
const campoPixCopiaCola = document.getElementById("pix-copia-cola");
const btnCopiarPix = document.getElementById("btn-copiar-pix");
const btnVoltarCarrinho = document.getElementById("btn-voltar-carrinho");
const btnConfirmarPagamento = document.getElementById("btn-confirmar-pagamento");
const spinnerPagamento = document.getElementById("spinner-pagamento");
const textoConfirmarPagamento = document.getElementById("texto-confirmar-pagamento");

let presentesCache = [];
let carrinho = [];
const quantidadesSelecionadas = {};

function urlImagem(caminho, tamanho = "card") {
    if (!caminho) return "imagens/flor-central2.png";
    if (caminho.startsWith("http://") || caminho.startsWith("https://")) {
        if (caminho.includes("res.cloudinary.com") && caminho.includes("/image/upload/") && !caminho.includes("/image/upload/w_")) {
            const transform = tamanho === "admin"
                ? "w_480,h_264,c_fill,q_auto:good,f_auto"
                : "w_320,h_320,c_fill,q_auto:good,f_auto";
            return caminho.replace("/image/upload/", `/image/upload/${transform}/`);
        }
        return caminho;
    }
    return `${API_BASE}${caminho}`;
}

function formatarValor(valor) {
    const numero = Number(valor);
    if (Number.isNaN(numero)) return "R$ 0,00";
    return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function cotasDisponiveis(presente) {
    if (presente.comprado && (!presente.cotasVendidas || presente.cotasVendidas === 0)) {
        return 0;
    }
    const total = presente.cotasTotal || 1;
    const vendidas = presente.cotasVendidas || 0;
    return Math.max(0, total - vendidas);
}

function quantidadeNoCarrinho(presenteId) {
    const item = carrinho.find(i => i.presenteId === presenteId);
    return item ? item.quantidade : 0;
}

function limparCarrinho() {
    carrinho = [];
    esconderPainelPix();
    atualizarPainelCarrinho();
    renderizarPresentes(presentesCache);
}

function esconderPainelPix() {
    painelPix.classList.add("escondido");
    painelCarrinho.classList.remove("escondido");
    campoPixCopiaCola.value = "";
    const ctx = canvasQrPix.getContext("2d");
    ctx.clearRect(0, 0, canvasQrPix.width, canvasQrPix.height);
}

function montarItensCarrinho() {
    return carrinho.map(item => ({
        presenteId: item.presenteId,
        quantidade: item.quantidade
    }));
}

function exibirPainelPix(dadosPix) {
    painelCarrinho.classList.add("escondido");
    painelPix.classList.remove("escondido");
    totalPixEl.textContent = formatarValor(dadosPix.total);
    campoPixCopiaCola.value = dadosPix.pixCopiaCola;

    const ctx = canvasQrPix.getContext("2d");
    ctx.clearRect(0, 0, canvasQrPix.width, canvasQrPix.height);

    if (typeof QRCode === "undefined") {
        toast("QR Code indisponível. Use o código copia e cola abaixo.", "erro");
        painelPix.scrollIntoView({ behavior: "smooth", block: "nearest" });
        return;
    }

    QRCode.toCanvas(canvasQrPix, dadosPix.pixCopiaCola, {
        width: 200,
        margin: 1,
        color: { dark: "#433f3f", light: "#ffffff" }
    }).catch(() => {
        toast("Não foi possível gerar o QR Code. Use o código copia e cola.", "erro");
    });

    painelPix.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function atualizarPainelCarrinho() {
    if (!carrinho.length) {
        painelCarrinho.classList.add("escondido");
        listaCarrinho.innerHTML = "";
        totalCarrinhoEl.textContent = formatarValor(0);
        return;
    }

    painelCarrinho.classList.remove("escondido");

    let total = 0;
    listaCarrinho.innerHTML = carrinho.map(item => {
        const subtotal = Number(item.valor) * item.quantidade;
        total += subtotal;
        return `
            <li class="item-carrinho">
                <div class="item-carrinho-info">
                    <span>${escapeHtml(item.nome)}</span>
                    <small>${item.quantidade} cota${item.quantidade > 1 ? "s" : ""} × ${formatarValor(item.valor)}</small>
                </div>
                <span>${formatarValor(subtotal)}</span>
                <button type="button" class="btn-remover-carrinho" data-id="${Number(item.presenteId)}" aria-label="Remover">×</button>
            </li>
        `;
    }).join("");

    totalCarrinhoEl.textContent = formatarValor(total);

    listaCarrinho.querySelectorAll(".btn-remover-carrinho").forEach(botao => {
        botao.addEventListener("click", () => {
            const id = Number(botao.dataset.id);
            carrinho = carrinho.filter(i => i.presenteId !== id);
            delete quantidadesSelecionadas[id];
            atualizarPainelCarrinho();
            renderizarPresentes(presentesCache);
        });
    });
}

function abrirModalPresentes() {
    abrirModal(modalPresentes);
    carregarPresentes();
}

function fecharModalPresentes() {
    fecharModal(modalPresentes);
    esconderPainelPix();
}

function renderizarPresentes(presentes) {
    loadingPresentes.style.display = "none";
    listaPresentes.innerHTML = "";
    presentesCache = presentes;

    if (!presentes.length) {
        listaPresentes.innerHTML = `<p class="aviso-presentes">Nenhum presente cadastrado ainda. Em breve!</p>`;
        return;
    }

    presentes.forEach(presente => {
        const disponiveis = cotasDisponiveis(presente);
        const noCarrinho = quantidadeNoCarrinho(presente.id);
        const restantes = disponiveis - noCarrinho;
        const esgotado = restantes <= 0;
        const qtd = quantidadesSelecionadas[presente.id] || 1;
        const qtdMax = Math.max(restantes, 1);

        if (!quantidadesSelecionadas[presente.id]) {
            quantidadesSelecionadas[presente.id] = 1;
        } else if (quantidadesSelecionadas[presente.id] > restantes && restantes > 0) {
            quantidadesSelecionadas[presente.id] = restantes;
        }

        const card = document.createElement("article");
        card.className = `card-presente${esgotado ? " comprado" : ""}`;
        card.dataset.id = presente.id;

        const cotasTotal = presente.cotasTotal || 1;
        const cotasVendidas = presente.cotasVendidas || 0;
        const infoCotas = esgotado
            ? `<span class="badge-comprado">${disponiveis === 0 && presente.comprado ? "Esgotado" : "No carrinho"}</span>`
            : `<p class="cotas-info">${disponiveis}/${cotasTotal} cotas livres</p>`;

        const nomeSafe = escapeHtml(presente.nome);
        const descSafe = escapeHtml(presente.descricao || "");
        const imgSafe = escapeHtml(safeUrl(urlImagem(presente.imagem), "imagens/flor-central2.png"));

        card.innerHTML = `
            <img src="${imgSafe}" alt="${nomeSafe}" onerror="this.src='imagens/flor-central2.png'">
            <div class="card-presente-corpo">
                ${infoCotas}
                <h4>${nomeSafe}</h4>
                <p class="descricao-presente">${descSafe}</p>
                <p class="valor-presente">${formatarValor(presente.valor)}<small style="font-size:10px;font-weight:400;color:#888"> / cota</small></p>
                <div class="controle-quantidade">
                    <button type="button" class="btn-qtd btn-menos" data-id="${presente.id}" ${esgotado ? "disabled" : ""}>−</button>
                    <span class="qtd-valor" data-id="${presente.id}">${Math.min(qtd, qtdMax)}</span>
                    <button type="button" class="btn-qtd btn-mais" data-id="${presente.id}" ${esgotado || qtd >= restantes ? "disabled" : ""}>+</button>
                </div>
                <button type="button" class="btn-presentear" data-id="${presente.id}" ${esgotado ? "disabled" : ""}>
                    ${esgotado ? "Indisponível" : "Presentear"}
                </button>
            </div>
        `;

        listaPresentes.appendChild(card);
    });

    listaPresentes.querySelectorAll(".btn-menos").forEach(botao => {
        botao.addEventListener("click", () => {
            const id = Number(botao.dataset.id);
            const atual = quantidadesSelecionadas[id] || 1;
            quantidadesSelecionadas[id] = Math.max(1, atual - 1);
            renderizarPresentes(presentesCache);
        });
    });

    listaPresentes.querySelectorAll(".btn-mais").forEach(botao => {
        botao.addEventListener("click", () => {
            const id = Number(botao.dataset.id);
            const presente = presentesCache.find(p => p.id === id);
            if (!presente) return;
            const max = cotasDisponiveis(presente) - quantidadeNoCarrinho(id);
            const atual = quantidadesSelecionadas[id] || 1;
            quantidadesSelecionadas[id] = Math.min(max, atual + 1);
            renderizarPresentes(presentesCache);
        });
    });

    listaPresentes.querySelectorAll(".btn-presentear:not(:disabled)").forEach(botao => {
        botao.addEventListener("click", () => {
            const id = Number(botao.dataset.id);
            const presente = presentesCache.find(p => p.id === id);
            if (!presente) return;

            const qtd = quantidadesSelecionadas[id] || 1;
            const max = cotasDisponiveis(presente) - quantidadeNoCarrinho(id);

            if (qtd > max) {
                toast(`Só restam ${max} cota(s) para "${presente.nome}".`, "erro");
                return;
            }

            const existente = carrinho.find(i => i.presenteId === id);
            if (existente) {
                existente.quantidade += qtd;
            } else {
                carrinho.push({
                    presenteId: id,
                    nome: presente.nome,
                    valor: presente.valor,
                    quantidade: qtd
                });
            }

            quantidadesSelecionadas[id] = 1;
            atualizarPainelCarrinho();
            renderizarPresentes(presentesCache);
            painelCarrinho.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
    });
}

function carregarPresentes() {
    loadingPresentes.style.display = "flex";
    listaPresentes.innerHTML = "";

    fetch(`${API_BASE}/api/presentes`, {
        headers: apiHeaders()
    })
        .then(resposta => {
            if (!resposta.ok) throw new Error("Erro ao buscar presentes");
            return resposta.json();
        })
        .then(renderizarPresentes)
        .catch(() => {
            loadingPresentes.style.display = "none";
            listaPresentes.innerHTML = `<p class="aviso-presentes">Não foi possível carregar os presentes. Tente novamente em instantes.</p>`;
        });
}

botaoPresentes.addEventListener("click", abrirModalPresentes);
botaoFecharPresentes.addEventListener("click", fecharModalPresentes);

window.addEventListener("click", (evento) => {
    if (evento.target === modalPresentes) {
        fecharModalPresentes();
    }
});

btnLimparCarrinho.addEventListener("click", limparCarrinho);

btnFinalizarCarrinho.addEventListener("click", () => {
    if (!carrinho.length) {
        toast("Adicione pelo menos uma cota ao carrinho.", "erro");
        return;
    }

    const nome = campoNomeComprador.value.trim();
    if (!nome) {
        toast("Digite seu nome antes de pagar.", "erro");
        campoNomeComprador.focus();
        return;
    }

    spinnerCompra.classList.remove("escondido");
    textoFinalizarCarrinho.textContent = "Gerando PIX...";
    btnFinalizarCarrinho.disabled = true;

    fetch(`${API_BASE}/api/presentes/gerar-pix`, {
        method: "POST",
        headers: apiHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ nomeComprador: nome, itens: montarItensCarrinho() })
    })
        .then(async resposta => {
            const corpo = await resposta.json().catch(() => ({}));
            if (!resposta.ok) {
                const msg = typeof corpo === "string" ? corpo : corpo.message || "Erro ao gerar PIX";
                throw new Error(msg);
            }
            exibirPainelPix(corpo);
        })
        .catch(erro => {
            toast(erro.message || "Não foi possível gerar o PIX. Tente novamente.", "erro");
        })
        .finally(() => {
            spinnerCompra.classList.add("escondido");
            textoFinalizarCarrinho.textContent = "Pagar com PIX";
            btnFinalizarCarrinho.disabled = false;
        });
});

btnPagarCartao?.addEventListener("click", () => {
    if (!carrinho.length) {
        toast("Adicione pelo menos uma cota ao carrinho.", "erro");
        return;
    }
    const nome = campoNomeComprador.value.trim();
    if (!nome) {
        toast("Digite seu nome antes de pagar.", "erro");
        campoNomeComprador.focus();
        return;
    }

    spinnerCartao?.classList.remove("escondido");
    if (textoPagarCartao) textoPagarCartao.textContent = "Abrindo Mercado Pago...";
    btnPagarCartao.disabled = true;

    fetch(`${API_BASE}/api/presentes/checkout-cartao`, {
        method: "POST",
        headers: apiHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ nomeComprador: nome, itens: montarItensCarrinho() })
    })
        .then(async resposta => {
            const corpo = await resposta.json().catch(() => ({}));
            if (!resposta.ok) {
                const msg = typeof corpo === "string" ? corpo : corpo.message || "Erro ao iniciar cartão";
                throw new Error(msg);
            }
            if (!corpo.checkoutUrl) throw new Error("Link de pagamento não retornado.");
            sessionStorage.setItem("pedido_presente_id", String(corpo.pedidoId || ""));
            window.location.href = corpo.checkoutUrl;
        })
        .catch(erro => {
            toast(erro.message || "Não foi possível abrir o pagamento no cartão.", "erro");
        })
        .finally(() => {
            spinnerCartao?.classList.add("escondido");
            if (textoPagarCartao) textoPagarCartao.textContent = "Pagar com cartão";
            btnPagarCartao.disabled = false;
        });
});

/* Retorno do Mercado Pago após pagar presente no cartão */
(function confirmarPresentePagoSeRetorno() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("presente_pago") !== "1") return;
    const pedidoId = params.get("pedido") || sessionStorage.getItem("pedido_presente_id");
    const paymentId = params.get("payment_id") || params.get("collection_id");
    if (!pedidoId || !paymentId || paymentId === "null") {
        toast("Recebemos seu retorno. Se o pagamento foi aprovado, a cota será confirmada em instantes.", "info");
        return;
    }
    fetch(`${API_BASE}/api/presentes/confirmar-pagamento-mp`, {
        method: "POST",
        headers: apiHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ pedidoId: Number(pedidoId), paymentId: String(paymentId) })
    })
        .then(async res => {
            const corpo = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(typeof corpo === "string" ? corpo : corpo.message || "Falha ao confirmar");
            limparCarrinho();
            sessionStorage.removeItem("pedido_presente_id");
            toast(corpo.mensagem || "Presente confirmado! Obrigado 💚", "sucesso");
            if (typeof carregarPresentes === "function") carregarPresentes();
        })
        .catch(err => {
            toast(err.message || "Pagamento em processamento. Obrigado!", "info");
        });
})();

btnVoltarCarrinho.addEventListener("click", esconderPainelPix);

btnCopiarPix.addEventListener("click", async () => {
    const codigo = campoPixCopiaCola.value;
    if (!codigo) return;

    try {
        await navigator.clipboard.writeText(codigo);
        btnCopiarPix.textContent = "Código copiado!";
        toast("Código PIX copiado!", "sucesso");
        setTimeout(() => {
            btnCopiarPix.textContent = "Copiar código PIX";
        }, 2000);
    } catch {
        campoPixCopiaCola.select();
        document.execCommand("copy");
        toast("Código selecionado — use Ctrl+C ou Cmd+C para copiar.", "info");
    }
});

btnConfirmarPagamento.addEventListener("click", () => {
    if (!carrinho.length) return;

    const nome = campoNomeComprador.value.trim();
    if (!nome) {
        toast("Informe seu nome antes de confirmar.", "erro");
        return;
    }

    spinnerPagamento.classList.remove("escondido");
    textoConfirmarPagamento.textContent = "Confirmando...";
    btnConfirmarPagamento.disabled = true;

    fetch(`${API_BASE}/api/presentes/finalizar-carrinho`, {
        method: "POST",
        headers: apiHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ nomeComprador: nome, itens: montarItensCarrinho() })
    })
        .then(async resposta => {
            const corpo = await resposta.json().catch(() => ({}));
            if (!resposta.ok) {
                const msg = typeof corpo === "string" ? corpo : corpo.message || "Erro ao confirmar pagamento";
                throw new Error(msg);
            }
            const total = corpo.total != null ? formatarValor(corpo.total) : "";
            toast(corpo.mensagem || `Obrigado pelo carinho! Total: ${total} 💚`, "sucesso");
            carrinho = [];
            campoNomeComprador.value = "";
            Object.keys(quantidadesSelecionadas).forEach(k => delete quantidadesSelecionadas[k]);
            esconderPainelPix();
            atualizarPainelCarrinho();
            carregarPresentes();
        })
        .catch(erro => {
            toast(erro.message || "Não foi possível confirmar. Tente novamente.", "erro");
        })
        .finally(() => {
            spinnerPagamento.classList.add("escondido");
            textoConfirmarPagamento.textContent = "Já paguei — avisar o casal";
            btnConfirmarPagamento.disabled = false;
        });
});

/* =======================================================
   LÓGICA DO MODAL DE DRESS CODE
   ======================================================= */

const botaoDresscode = document.getElementById("btn-dresscode");
const modalDresscode = document.getElementById("modal-dresscode");
const botaoFecharDresscode = document.getElementById("fechar-modal-dresscode");

function abrirModalDresscode() {
    abrirModal(modalDresscode);
}

function fecharModalDresscode() {
    fecharModal(modalDresscode);
}

botaoDresscode.addEventListener("click", abrirModalDresscode);
botaoFecharDresscode.addEventListener("click", fecharModalDresscode);

window.addEventListener("click", (evento) => {
    if (evento.target === modalDresscode) {
        fecharModalDresscode();
    }
});

/* =======================================================
   MURAL DE RECADOS
   ======================================================= */
(function initRecados() {
    const listaEl = document.getElementById("lista-recados");
    const form = document.getElementById("form-recado");
    const campoNome = document.getElementById("recado-nome");
    const campoMsg = document.getElementById("recado-mensagem");
    const contador = document.getElementById("recado-contador");
    const btn = document.getElementById("btn-enviar-recado");
    const textoBtn = document.getElementById("texto-enviar-recado");
    const msgStatus = document.getElementById("msg-recado");
    if (!listaEl || !form) return;

    function atualizarContador() {
        if (!contador || !campoMsg) return;
        contador.textContent = `${campoMsg.value.length} / 280`;
    }

    function renderRecados(lista) {
        listaEl.innerHTML = "";
        if (!lista.length) {
            const p = document.createElement("p");
            p.className = "lista-recados-vazia";
            p.textContent = "Seja o primeiro a deixar um recado.";
            listaEl.appendChild(p);
            return;
        }
        lista.forEach((item) => {
            const li = document.createElement("li");
            li.className = "item-recado";

            const nomeEl = document.createElement("p");
            nomeEl.className = "recado-nome";
            nomeEl.textContent = item.nome || "Convidado";

            const textoEl = document.createElement("p");
            textoEl.className = "recado-texto";
            textoEl.textContent = item.mensagem || "";

            li.append(nomeEl, textoEl);
            listaEl.appendChild(li);
        });
    }

    async function carregarRecados() {
        try {
            const res = await fetch(`${API_BASE}/api/recados`, { headers: apiHeaders() });
            if (!res.ok) throw new Error("falha");
            const data = await res.json();
            renderRecados(Array.isArray(data) ? data : []);
        } catch {
            listaEl.innerHTML = "";
            const p = document.createElement("p");
            p.className = "lista-recados-vazia";
            p.textContent = "Os recados aparecem em instantes.";
            listaEl.appendChild(p);
        }
    }

    campoMsg?.addEventListener("input", atualizarContador);
    atualizarContador();
    carregarRecados();

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nome = (campoNome?.value || "").trim();
        const mensagem = (campoMsg?.value || "").trim();
        if (!nome || !mensagem) {
            if (msgStatus) {
                msgStatus.className = "msg-recado erro";
                msgStatus.textContent = "Preencha nome e mensagem.";
            }
            return;
        }
        if (btn) btn.disabled = true;
        if (textoBtn) textoBtn.textContent = "Enviando...";
        if (msgStatus) {
            msgStatus.className = "msg-recado";
            msgStatus.textContent = "";
        }
        try {
            const res = await fetch(`${API_BASE}/api/recados`, {
                method: "POST",
                headers: apiHeaders({ "Content-Type": "application/json" }),
                body: JSON.stringify({ nome, mensagem })
            });
            const texto = await res.text();
            let data;
            try { data = JSON.parse(texto); } catch { data = texto; }
            if (!res.ok) {
                throw new Error(typeof data === "string" ? data : (data.message || "Não foi possível enviar."));
            }
            form.reset();
            atualizarContador();
            if (msgStatus) {
                msgStatus.className = "msg-recado ok";
                msgStatus.textContent = "Recado publicado. Obrigado!";
            }
            if (typeof toast === "function") toast("Recado enviado!", "sucesso");
            await carregarRecados();
        } catch (err) {
            if (msgStatus) {
                msgStatus.className = "msg-recado erro";
                msgStatus.textContent = err.message || "Falha ao enviar.";
            }
        } finally {
            if (btn) btn.disabled = false;
            if (textoBtn) textoBtn.textContent = "Enviar recado";
        }
    });
})();

(function initLinkPainel() {
    const link = document.getElementById("link-painel");
    if (!link) return;
    const token = localStorage.getItem("casamento_admin_token");
    if (token) {
        link.href = "admin/painel.html";
        link.textContent = "Abrir painel";
    }
})();
