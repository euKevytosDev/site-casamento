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

// INTERCEPTAR O ENVIO DO FORMULÁRIO (Para testes iniciais)
formulario.addEventListener("submit", (evento) => {
    evento.preventDefault(); // Evita que a página recarregue (comportamento padrão do HTML que estragaria o app)
    
    // Captura o que o convidado digitou no campo de texto
    const nomeDigitado = document.getElementById("nome-convidado").value;
    
    // Mostra um aviso na tela simulando o sucesso (depois vamos trocar isso pelo envio para o Spring Boot)
    alert(`Obrigado, ${nomeDigitado}! Sua presença foi registrada com sucesso.`);
    
    // Limpa o formulário e fecha o modal automaticamente após o envio
    formulario.reset(); // Apaga o nome que ficou escrito no campo de texto
    modalPresenca.style.display = "none"; // Esconde o modal para o usuário voltar a ver o convite
});