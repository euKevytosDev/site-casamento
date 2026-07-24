# Rafaella & Kevin — Site de Casamento

Site do nosso casamento (24/04/2027): convite animado, galeria, confirmação de presença, lista de presentes e painel admin. Feito mobile-first porque praticamente todo mundo abre pelo celular.

O front é HTML/CSS/JS puro. Os dados vêm de uma API Spring Boot em repositório separado.

## Links

- Nosso site: https://rafaekevin.com.br/
- Landing da marca (Loven): https://somosloven.com.br/
- Demo de outro casal: https://somosloven.com.br/sofiaelucas
- Painel: https://somosloven.com.br/admin/
- API: https://site-casamento-backend-nrfb.onrender.com
- Backend: [site-casamento-backend](https://github.com/euKevytosDev/site-casamento-backend)

## O que o convidado vê

- Abertura com selo de convite
- Galeria de fotos
- Confirmação de presença (sozinho ou em família)
- Lista de presentes com reserva
- Música de fundo
- Layout pensado pra tela pequena

## Painel admin (`/admin`)

Login com JWT. Dá pra ver/remover confirmações e cadastrar, editar ou apagar presentes (com upload de imagem via Cloudinary).

## Stack

| Camada | Tecnologia |
|--------|------------|
| Front | HTML, CSS, JavaScript (vanilla) |
| Back | Spring Boot + PostgreSQL (Neon) |
| Imagens | Cloudinary |
| Host front | GitHub Pages / Hostinger (domínio próprio) |
| Host API | Render |

## Estrutura

```text
├── index.html      # site dos convidados
├── style.css
├── script.js       # convite, presença, presentes, fetch
├── imagens/
├── musicas/
└── admin/
    ├── index.html  # login
    ├── painel.html
    ├── admin.css
    └── admin.js
```

## Como o front fala com a API

```javascript
const API_BASE = "https://site-casamento-backend-nrfb.onrender.com";
```

Endpoints que o site mais usa:

| Método | Rota | Uso |
|--------|------|-----|
| GET | `/api/presenca` | Listar confirmações |
| POST | `/api/presenca/confirmar-familia` | Confirmar família |
| GET | `/api/presentes` | Listar presentes |
| POST | `/api/presentes/{id}/comprar` | Reservar |

Pra testar com API local, troca o `API_BASE` em `script.js` para `http://localhost:8080`.

## Rodar local

```bash
git clone https://github.com/euKevytosDev/site-casamento.git
```

Abre o `index.html` no navegador ou com Live Server. Se a API na Render estiver “fria”, a primeira resposta pode demorar uns 30s (plano free).

## Por que vanilla?

Queria controle total do visual e das animações sem carregar framework pra um site de uma página. O JS fica em cima de `fetch`, DOM e eventos — o suficiente pro fluxo dos convidados e do admin.

## Autor

Raian Kevin — Full Stack

- GitHub: [@euKevytosDev](https://github.com/euKevytosDev)
- Portfólio: [portfolio-raian](https://github.com/euKevytosDev/portfolio-raian)
