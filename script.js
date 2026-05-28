const hero = document.querySelector(".hero");
const site = document.querySelector(".site");

const musica = document.getElementById("musica");
musica.volume = 0.3;

hero.addEventListener("click", () => {

    musica.play();

    // fade out da tela inicial
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

// 6. AÇÃO DO BOTÃO FINAL "🚀 CONFIRMAR FAMÍLIA INTEIRA" (CONEXÃO REAL BACK-END)
btnEnviarFamilia.addEventListener("click", () => {

    // Mostra no console para você inspecionar se quiser
    console.log("Enviando para o Spring Boot:", listaFamilia);

    // 🌐 ENSINAMENTO DETALHADO (A REQUISIÇÃO AJAX/FETCH):
    // Chamamos a rota exata que criamos no PresencaController do Java
    fetch("http://localhost:8080/api/presenca/confirmar-familia", {
        method: "POST", // Avisa ao garçom que estamos enviando dados novos
        headers: {
            "Content-Type": "application/json" // Avisa ao Java que estamos entregando o formato JSON (texto estruturado)
        },
        body: JSON.stringify(listaFamilia) // Transforma o nosso Array do JS em uma String de texto JSON pro Java conseguir ler
    })
        .then(resposta => {
            if (resposta.ok) {
                // Se o status HTTP for 200 (Sucesso)
                alert("Presença da família confirmada com sucesso! Muito obrigado. ✨");

                // Reseta a lista e fecha o modal
                listaFamilia = [];
                atualizarInterfaceLista();
                modalPresenca.style.display = "none";
            } else {
                // Se o servidor responder com algum erro (Ex: 400, 500)
                alert("Ops! Ocorreu um erro ao enviar os dados. Tente novamente.");
            }
        })
        .catch(erro => {
            // Se o back-end estiver desligado ou a rede falhar
            console.error("Erro de conexão:", erro);
            alert("Não foi possível conectar ao servidor. O seu Back-end está rodando?");
        });
});