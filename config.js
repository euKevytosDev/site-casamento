// Config DESTE casamento.
// Quando vender pra outra noiva: copia o site e muda SÓ este arquivo (+ fotos).
window.SITE_CONFIG = {
    // Backend (igual pra todos os clientes)
    apiBase: "https://site-casamento-backend-nrfb.onrender.com",
    // Local:
    // apiBase: "http://localhost:8080",

    // slug do banco = header X-Site-Id
    siteId: "rafaekevin",

    // Nomes (aparecem na tela)
    nomeNoiva: "Rafaella",
    nomeNoivo: "Kevin",

    // Apelidos curtos (aba / WhatsApp)
    nomeCurto: "Rafa & Kevin",

    // Data e hora do casamento
    dataCasamento: "2027-04-24",  // formato AAAA-MM-DD
    horaCasamento: "16:00",
    diaSemana: "SÁBADO",
    mesExtenso: "ABRIL",

    // Domínio do site (pra meta/WhatsApp)
    siteUrl: "https://rafaekevin.com.br/",

    // Texto do preview no WhatsApp / redes
    ogDescricao: "Com a bênção de Deus, convidamos você para o nosso casamento.",
    // Caminho da imagem OG (relativo ao siteUrl)
    ogImagem: "imagens/og-image.jpg",

    // Local da festa + link do Google Maps
    localNome: "Espaço Salaberry",
    mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=Espaço+Salaberry",

    // Pais (opcional — cada casal muda)
    paisNoiva: "Warlen e Rosimar",
    paisNoivo: "Ricardo e Luiza",

    // Cores do tema (iguais às do CSS :root — outra noiva muda só aqui)
    cores: {
        verde: "#616e48",
        verdeEscuro: "#4f5a3a",
        verdeClaro: "#839164",
        fundo: "#ffffff",
        fundoBege: "#e0e1cf",
        texto: "#433f3f",
        textoHero: "#3a4332"
    }
};