# Rafaella & Kevin — Site de Casamento

Site de casamento completo com design **mobile-first**, animações suaves, confirmação de presença, lista de presentes e painel administrativo. Desenvolvido como projeto pessoal para o casamento de Rafaella e Kevin (24.04.2027).

## Demo

- Site ao vivo: https://rafaekevin.com.br/
- Repositório: https://github.com/euKevytosDev/site-casamento
- API (backend): https://site-casamento-backend-nrfb.onrender.com

## Sobre o projeto

Experiência interativa para convidados: abertura com convite animado, galeria de fotos, confirmação de presença em família, lista de presentes com compra online e trilha sonora ambiente.

O front-end consome uma **API REST** em Spring Boot (repositório separado) hospedada na Render, com banco PostgreSQL no Neon.

## Stack

| Tecnologia | Uso |
|---|---|
| HTML5 | Estrutura das seções |
| CSS3 | Layout, animações, responsividade |
| JavaScript (vanilla) | Convite, presença, presentes, fetch à API |
| Spring Boot + PostgreSQL | Backend (repo separado) |
| Cloudinary | Upload de imagens dos presentes |
| GitHub Pages | Hospedagem do front-end |
| Render + Neon | Hospedagem da API e banco |

## Funcionalidades

### Para convidados
- Hero com selo de convite interativo
- Galeria de fotos do casal
- Confirmação de presença (individual ou em família)
- Lista de presentes com reserva/compra
- Player de músicas ambiente
- Layout otimizado para celular

### Painel admin (`/admin`)
- Login com JWT
- Gerenciar confirmações de presença
- Cadastrar, editar e remover presentes (com upload de imagem)

## Estrutura de pastas

```text
site-casamento/
├── index.html          # Site principal para convidados
├── style.css           # Estilos e animações
├── script.js           # Lógica do site + integração com API
├── imagens/            # Fotos do casal e elementos visuais
├── musicas/            # Trilha sonora do site
└── admin/
    ├── index.html      # Tela de login
    ├── painel.html     # Painel administrativo
    ├── admin.css
    └── admin.js
```

## Integração com a API

O front-end aponta para a API em produção:

```javascript
const API_BASE = "https://site-casamento-backend-nrfb.onrender.com";
```

### Principais endpoints usados

| Método | Rota | Função |
|---|---|---|
| GET | `/api/presenca` | Listar confirmações |
| POST | `/api/presenca/confirmar-familia` | Confirmar família inteira |
| GET | `/api/presentes` | Listar presentes |
| POST | `/api/presentes/{id}/comprar` | Reservar presente |

Backend completo: [site-casamento-backend](https://github.com/euKevytosDev/site-casamento-backend)

## Como rodar localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/euKevytosDev/site-casamento.git
   ```
2. Abra `index.html` no navegador ou use **Live Server**.
3. Para testar com API local, altere `API_BASE` em `script.js` para `http://localhost:8080`.

> **Nota:** a API na Render pode demorar ~30s na primeira requisição (plano gratuito).

## Deploy

- **Front-end:** GitHub Pages (branch `main`)
- **Back-end:** Render — ver README do repositório `site-casamento-backend`

## Conceitos de JavaScript usados

- `fetch` para comunicação com API REST
- `addEventListener` para interações (convite, modais, formulários)
- Manipulação do DOM (`querySelector`, `innerHTML`, classes)
- `setTimeout` e funções autoexecutáveis (IIFE)
- Validação e feedback visual para o usuário

## Autor

**Raian Kevin** — Desenvolvedor Full Stack

- GitHub: [@euKevytosDev](https://github.com/euKevytosDev)
- Portfólio: [portfolio-raian](https://github.com/euKevytosDev/portfolio-raian)
