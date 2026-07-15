# Checklist de entrega — site de casamento

Use este roteiro a cada noiva. Backend e banco são **os mesmos**; o que muda é o front (pasta) + 1 Site no banco.

---

## 0. Antes de começar (uma vez no negócio)

- [ ] Backend no ar (Render) com multi-tenant
- [ ] Banco Neon com tabela `site` e colunas de PIX
- [ ] Login admin funcionando
- [ ] Template do front pronto (repo/pasta modelo)
- [ ] (Recomendado) Render Starter — evita cold start pra cliente pagante

---

## 1. Criar o casamento no backend

- [ ] Login admin → `POST /api/auth/login` → copiar token
- [ ] `POST /api/admin/sites` com:
  - `slug` (ex: `mariaejoao`) — só letras/números/hífen
  - `nomeNoiva`, `nomeNoivo`
  - `dataCasamento` (`AAAA-MM-DD`)
  - `pixChave`, `pixNomeRecebedor`, `pixCidade` **da noiva**
- [ ] Conferir `GET /api/admin/sites` — site ativo aparece

---

## 2. Clonar o front

- [ ] Duplicar a pasta/repo do template (ou do site de vocês)
- [ ] Nome da pasta claro (ex: `site-casamento-mariaejoao`)
- [ ] **Não** misturar com a pasta `rafaekevin` no dia a dia

---

## 3. Configurar o `config.js`

- [ ] `siteId` = mesmo slug do banco
- [ ] `nomeNoiva`, `nomeNoivo`, `nomeCurto`
- [ ] `dataCasamento`, `horaCasamento`, `diaSemana`, `mesExtenso`
- [ ] `siteUrl` = domínio final do casal (com `https://` e `/` no fim)
- [ ] `ogDescricao`, `ogImagem`
- [ ] `localNome`, `mapsUrl`
- [ ] `paisNoiva`, `paisNoivo`
- [ ] `cores` (se o casal quiser outra paleta)

**Dica:** abrir com **Live Server** (não `file://`) na hora de testar admin/API.

---

## 4. Conteúdo visual

- [ ] Trocar fotos (hero, foto2, local, og-image, favicons se precisar)
- [ ] Ajustar `<head>` estático do `index.html` (title/OG) se o preview do WhatsApp exigir — crawlers nem sempre rodam JS
- [ ] Música (se o casal pedir outra)
- [ ] Textos extras (versículo, dress code) se combinado

---

## 5. Domínio + hospedagem do front

- [ ] Subir o front no GitHub Pages (repo/pasta do cliente)
- [ ] Apontar DNS do domínio do casal
- [ ] HTTPS ok
- [ ] Testar URL pública no celular

---

## 6. Cadastrar dados no admin

- [ ] Abrir `/admin` **desse** front (Live Server ou domínio)
- [ ] Conferir subtítulo = nomes do casal
- [ ] Cadastrar presentes (com foto)
- [ ] (Opcional) Testar 1 presença de teste e apagar depois

---

## 7. Testes finais (obrigatório)

- [ ] Site abre, nomes/data/local corretos
- [ ] `X-Site-Id` certo: lista **só** os presentes desse casal
- [ ] Confirmar presença funciona
- [ ] Gerar PIX: chave/nome = do casal (não a sua, se for outro cliente)
- [ ] Admin lista presentes/presenças/histórico desse site
- [ ] Preview WhatsApp (title + imagem) aceitável

---

## 8. Entrega ao casal

- [ ] Link do site + domínio
- [ ] Login/senha do admin (ou só você gerencia — alinhar no contrato)
- [ ] Explicar: presentes, presença, PIX
- [ ] Combinar o que ainda pode mudar (fotos, textos) e prazo

---

## 9. Encerrar / suporte

- [ ] Anotar slug, domínio, data do casamento (planilha simples)
- [ ] Se cancelar cliente: `PATCH /api/admin/sites/{id}/desativar` (não apaga dados)

---

## Lembretes rápidos

| Não misturar | Por quê |
|--------------|---------|
| Pastas de front | Cada `config.js` = 1 casamento |
| PIX | Sempre o da noiva no `site` |
| Live Server | `file://` quebra upload/admin |

| 1 backend | N fronts clonados | 1 Site por slug no Neon |
