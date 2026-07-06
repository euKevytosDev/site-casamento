const API_BASE = "https://site-casamento-backend-nrfb.onrender.com";
const TOKEN_KEY = "casamento_admin_token";
const LOGIN_KEY = "casamento_admin_login";

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function setAuth(token, login) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(LOGIN_KEY, login);
}

function getLogin() {
    return localStorage.getItem(LOGIN_KEY) || "";
}

function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LOGIN_KEY);
    window.location.href = "index.html";
}

function urlImagem(caminho, tamanho = "admin") {
    if (!caminho) return "";
    if (caminho.startsWith("http")) {
        if (caminho.includes("res.cloudinary.com") && caminho.includes("/image/upload/") && !caminho.includes("/image/upload/w_")) {
            const transform = tamanho === "lista"
                ? "w_320,h_176,c_fill,q_auto:good,f_auto"
                : "w_480,h_264,c_fill,q_auto:good,f_auto";
            return caminho.replace("/image/upload/", `/image/upload/${transform}/`);
        }
        return caminho;
    }
    return `${API_BASE}${caminho}`;
}

function formatarValor(valor) {
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function aplicarMascaraMoeda(input) {
    input.addEventListener("input", () => {
        const apenasNumeros = input.value.replace(/\D/g, "");

        if (!apenasNumeros) {
            input.value = "";
            return;
        }

        const numero = Number(apenasNumeros) / 100;
        input.value = formatarValor(numero);
    });
}

function parseMoedaParaNumero(valorMascarado) {
    if (!valorMascarado) return 0;
    const apenasNumeros = valorMascarado.replace(/\D/g, "");
    return Number(apenasNumeros || 0) / 100;
}

function definirValorComMascara(input, valor) {
    if (valor === null || valor === undefined || valor === "") {
        input.value = "";
        return;
    }

    input.value = formatarValor(valor);
}

function formatarData(data) {
    if (!data) return "-";
    return new Date(data).toLocaleString("pt-BR");
}

async function apiFetch(caminho, opcoes = {}) {
    const headers = { ...(opcoes.headers || {}) };
    const token = getToken();

    if (token && !(opcoes.body instanceof FormData)) {
        headers["Content-Type"] = headers["Content-Type"] || "application/json";
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const resposta = await fetch(`${API_BASE}${caminho}`, { ...opcoes, headers });

    if (resposta.status === 401 || resposta.status === 403) {
        logout();
        throw new Error("Sessão expirada. Faça login novamente.");
    }

    return resposta;
}

async function lerErro(resposta) {
    const texto = await resposta.text();
    try {
        const json = JSON.parse(texto);
        return typeof json === "string" ? json : (json.message || texto);
    } catch {
        return texto || "Erro na requisição";
    }
}
