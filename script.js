const hero = document.querySelector(".hero");
const site = document.querySelector(".site");
const btnAbrirConvite = document.getElementById("btn-abrir-convite");

const API_BASE = "https://site-casamento-backend-nrfb.onrender.com";

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

const musica = document.getElementById("musica");
musica.volume = 0.9;
musica.loop = false; // Desativa o loop nativo do HTML para controlarmos o tempo via JS

btnAbrirConvite.addEventListener("click", () => {
    musica.currentTime = 70; // Força o início no minuto 1:10 (70 segundos)
    musica.play();

    // 🚀 GATILHO SILENCIOSO: Acorda a Render em segundo plano assim que entra no site!
    // Como não colocamos o ".then", o JS só faz a chamada e continua rodando o resto do site sem travar nada.
    fetch(`${API_BASE}/api/presenca`)
        .then(() => console.log("Servidor alertado com sucesso nos bastidores! ⏰"))    // fade out da tela inicial
        .catch(() => console.log("Servidor já deve estar acordado ou processando."));

    hero.style.opacity = "0";

    setTimeout(() => {
        hero.style.display = "none";

        // mostra o site
        site.style.display = "block";

        // pequeno delay pra ativar o fade in
        setTimeout(() => {
            site.style.opacity = "1";
        }, 50);

    }, 800); // tempo igual ao CSS
});

// EVENTO DE LOOP RECOBRANDO DE 1:39
musica.addEventListener("ended", () => {
    musica.currentTime = 99; // Reseta o áudio para 1:39 ao invés do zero
    musica.play();           // Toca novamente
});

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

function atualizarContador() {
    const dataCasamento = new Date("April 24, 2027 00:00:00").getTime();
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
    modalPresenca.style.display = "flex";
    atualizarInterfaceLista();
});

// FUNÇÃO PARA FECHAR O MODAL CLICANDO NO X
botaoFechar.addEventListener("click", () => {
    modalPresenca.style.display = "none"; // Altera o CSS de volta para 'none', escondendo o modal e o fundo escuro
});

// FUNÇÃO PARA FECHAR O MODAL CLICANDO FORA DA CAIXA BRANCA
window.addEventListener("click", (evento) => {
    // Se o clique do usuário aconteceu na cortina escura e não na caixinha branca de dentro...
    if (evento.target === modalPresenca) {
        modalPresenca.style.display = "none"; // ...esconde o modal (ótimo para a experiência no celular!)
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

        // Formata o texto bonito para o usuário ler
        const statusTexto = membro.confirmado ? "Confirmado" : "Não vai";
        li.innerHTML = `
            <span><strong>${membro.nomeConvidado}</strong> (${membro.idade} anos) - ${statusTexto}</span>
            <button class="btn-remover-membro" onclick="removerMembroDaLista(${index})">&times;</button>
        `;

        listaFamiliaVisual.appendChild(li);
    });
}

// ============================================================================
// 4. AÇÃO DO BOTÃO "➕ ADICIONAR À LISTA" (ATUALIZADO PARA CASAR COM O MODEL)
// ============================================================================
btnAdicionarMembro.addEventListener("click", () => {
    if (!campoNome.value || !campoIdade.value) {
        alert("Por favor, preencha o Nome e a Idade antes de adicionar!");
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
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(listaFamilia)
    })
        .then(resposta => {
            if (resposta.ok) {
                alert("Presença confirmada com sucesso! Muito obrigado. ✨");
                listaFamilia = [];
                atualizarInterfaceLista();
                modalPresenca.style.display = "none";
            } else {
                alert("Ops! Ocorreu um erro ao enviar os dados. Tente novamente.");
            }
        })
        .catch(erro => {
            console.error("Erro de conexão:", erro);
            alert("Não foi possível conectar ao servidor. O servidor pode estar iniciando, tente novamente em instantes.");
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
        alert("QR Code indisponível no momento. Use o código copia e cola abaixo para pagar.");
        painelPix.scrollIntoView({ behavior: "smooth", block: "nearest" });
        return;
    }

    QRCode.toCanvas(canvasQrPix, dadosPix.pixCopiaCola, {
        width: 200,
        margin: 1,
        color: { dark: "#433f3f", light: "#ffffff" }
    }).catch(() => {
        alert("Não foi possível gerar o QR Code. Use o código copia e cola abaixo.");
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
                    <span>${item.nome}</span>
                    <small>${item.quantidade} cota${item.quantidade > 1 ? "s" : ""} × ${formatarValor(item.valor)}</small>
                </div>
                <span>${formatarValor(subtotal)}</span>
                <button type="button" class="btn-remover-carrinho" data-id="${item.presenteId}" aria-label="Remover">×</button>
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
    modalPresentes.style.display = "flex";
    carregarPresentes();
}

function fecharModalPresentes() {
    modalPresentes.style.display = "none";
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

        card.innerHTML = `
            <img src="${urlImagem(presente.imagem)}" alt="${presente.nome}" onerror="this.src='imagens/flor-central2.png'">
            <div class="card-presente-corpo">
                ${infoCotas}
                <h4>${presente.nome}</h4>
                <p class="descricao-presente">${presente.descricao || ""}</p>
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
                alert(`Só restam ${max} cota(s) para "${presente.nome}".`);
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

    fetch(`${API_BASE}/api/presentes`)
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
        alert("Adicione pelo menos uma cota ao carrinho.");
        return;
    }

    const nome = campoNomeComprador.value.trim();
    if (!nome) {
        alert("Por favor, digite seu nome antes de pagar.");
        campoNomeComprador.focus();
        return;
    }

    spinnerCompra.classList.remove("escondido");
    textoFinalizarCarrinho.textContent = "Gerando PIX...";
    btnFinalizarCarrinho.disabled = true;

    fetch(`${API_BASE}/api/presentes/gerar-pix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
            alert(erro.message || "Não foi possível gerar o PIX. Tente novamente.");
        })
        .finally(() => {
            spinnerCompra.classList.add("escondido");
            textoFinalizarCarrinho.textContent = "Pagar com PIX";
            btnFinalizarCarrinho.disabled = false;
        });
});

btnVoltarCarrinho.addEventListener("click", esconderPainelPix);

btnCopiarPix.addEventListener("click", async () => {
    const codigo = campoPixCopiaCola.value;
    if (!codigo) return;

    try {
        await navigator.clipboard.writeText(codigo);
        btnCopiarPix.textContent = "Código copiado!";
        setTimeout(() => {
            btnCopiarPix.textContent = "Copiar código PIX";
        }, 2000);
    } catch {
        campoPixCopiaCola.select();
        document.execCommand("copy");
        alert("Código selecionado — use Ctrl+C ou Cmd+C para copiar.");
    }
});

btnConfirmarPagamento.addEventListener("click", () => {
    if (!carrinho.length) return;

    const nome = campoNomeComprador.value.trim();
    if (!nome) {
        alert("Informe seu nome antes de confirmar.");
        return;
    }

    spinnerPagamento.classList.remove("escondido");
    textoConfirmarPagamento.textContent = "Confirmando...";
    btnConfirmarPagamento.disabled = true;

    fetch(`${API_BASE}/api/presentes/finalizar-carrinho`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomeComprador: nome, itens: montarItensCarrinho() })
    })
        .then(async resposta => {
            const corpo = await resposta.json().catch(() => ({}));
            if (!resposta.ok) {
                const msg = typeof corpo === "string" ? corpo : corpo.message || "Erro ao confirmar pagamento";
                throw new Error(msg);
            }
            const total = corpo.total != null ? formatarValor(corpo.total) : "";
            alert(corpo.mensagem || `Obrigado pelo carinho! Total: ${total} 💚`);
            carrinho = [];
            campoNomeComprador.value = "";
            Object.keys(quantidadesSelecionadas).forEach(k => delete quantidadesSelecionadas[k]);
            esconderPainelPix();
            atualizarPainelCarrinho();
            carregarPresentes();
        })
        .catch(erro => {
            alert(erro.message || "Não foi possível confirmar. Tente novamente.");
        })
        .finally(() => {
            spinnerPagamento.classList.add("escondido");
            textoConfirmarPagamento.textContent = "Já paguei, confirmar";
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
    modalDresscode.style.display = "flex";
}

function fecharModalDresscode() {
    modalDresscode.style.display = "none";
}

botaoDresscode.addEventListener("click", abrirModalDresscode);
botaoFecharDresscode.addEventListener("click", fecharModalDresscode);

window.addEventListener("click", (evento) => {
    if (evento.target === modalDresscode) {
        fecharModalDresscode();
    }
});

/* Acesso discreto ao admin: tocar 3 vezes seguidas no número de dias */
(function initAcessoAdminOculto() {
    const gatilho = document.getElementById("dias");
    if (!gatilho) return;

    const TOQUES_NECESSARIOS = 3;
    const TEMPO_ENTRE_TOQUES_MS = 800;
    let contagem = 0;
    let ultimoToque = 0;

    function irParaAdmin() {
        const token = localStorage.getItem("casamento_admin_token");
        window.location.href = token ? "admin/painel.html" : "admin/index.html";
    }

    function registrarToque() {
        const agora = Date.now();

        if (agora - ultimoToque > TEMPO_ENTRE_TOQUES_MS) {
            contagem = 0;
        }

        contagem += 1;
        ultimoToque = agora;

        if (contagem >= TOQUES_NECESSARIOS) {
            contagem = 0;
            irParaAdmin();
        }
    }

    gatilho.addEventListener("click", registrarToque);
})();