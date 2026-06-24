const hero = document.querySelector(".hero");
const site = document.querySelector(".site");

const musica = document.getElementById("musica");
musica.volume = 0.9;
musica.loop = false; // Desativa o loop nativo do HTML para controlarmos o tempo via JS

hero.addEventListener("click", () => {

    musica.currentTime = 70; // Força o início no minuto 1:10 (70 segundos)
    musica.play();

    // 🚀 GATILHO SILENCIOSO: Acorda a Render em segundo plano assim que entra no site!
    // Como não colocamos o ".then", o JS só faz a chamada e continua rodando o resto do site sem travar nada.
    fetch("https://site-casamento-backend-nrfb.onrender.com/api/presenca")
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

window.addEventListener("scroll", () => {

    const posicao = versiculo.getBoundingClientRect().top; /* posição do elemento */
    const alturaTela = window.innerHeight; /* altura da tela */

    if (posicao < alturaTela - 50) { /* quando entra na tela */
        versiculo.classList.add("ativo"); /* ativa animação */
    }

});

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
    modalPresenca.style.display = "flex"; // Altera o CSS do modal de 'none' para 'flex', fazendo ele surgir na tela
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
            <span><strong>${membro.nome}</strong> (${membro.idade} anos) - ${statusTexto}</span>
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

    // 🚨 AJUSTE AQUI: Mudamos de nomeConvidado para nome
    const novoMembro = {
        nome: campoNome.value,
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

    fetch("https://site-casamento-backend-nrfb.onrender.com/api/presenca/confirmar-familia", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(listaFamilia)
    })
        .then(resposta => {
            if (resposta.ok) {
                alert("Presença da família confirmada com sucesso! Muito obrigado. ✨");
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
            // 2. DESATIVA O MODO CARREGANDO: O bloco '.finally' roda SEMPRE (se der certo ou se der erro)
            // Aqui nós restauramos o botão para o estado original caso o usuário precise tentar de novo
            spinner.classList.add("escondido");
            btnTexto.innerText = "🚀 Confirmar Família Inteira";
            btnEnviarFamilia.disabled = false;
        });
});