# Gerenciador de Tarefas Acadêmicas

Aplicação desenvolvida para a disciplina de **Desenvolvimento Frontend (2026.2)**.
Trata-se de um quadro Kanban acadêmico construído progressivamente ao longo de quatro entregas, utilizando exclusivamente **HTML5 semântico**, **CSS3 responsivo** e **JavaScript moderno (ES Modules)**, sem frameworks ou bibliotecas externas.


## 🌐 Demonstração Online (GitHub Pages)

Acesse a versão publicada e funcional da aplicação:
🔗 **[https://crispolas.github.io/DESENVOLVIMENTO-FRONT-END/](https://crispolas.github.io/DESENVOLVIMENTO-FRONT-END/)**


## 📁 Estrutura do Projeto

```text
DESENVOLVIMENTO-FRONT-END/
├── index.html          # Estrutura semântica e acessível (E1 e E4)
├── styles.css          # Estilização com design tokens, Grid e Flexbox (E2)
├── dados.json          # Mock de dados servido na mesma origem (E3)
├── js/
│   ├── api.js          # Consumo assíncrono via fetch e validação HTTP (E3)
│   ├── estado.js       # Estado canônico único e função seletora pura (E4)
│   ├── estados.js      # Gerenciador dos 4 estados da tela e região viva (E3/E4)
│   ├── renderizacao.js # Manipulação do DOM com replaceChildren e textContent (E3/E4)
│   └── app.js          # Orquestrador principal e ciclo de eventos (E3/E4)
└── README.md           # Documentação e link de publicação
```

---

## 🚀 Evolução das Entregas

### **E1 — Estrutura Semântica e Acessível (HTML)**
* Marcação estritamente semântica com `<header>`, `<main>`, `<section>`, `<article>`, `<dl>`, `<form>` e `<footer>`.
* Acessibilidade nativa: landmarks nomeados com `aria-labelledby`, hierarquia de títulos contínua (`h1` $\rightarrow$ `h2` $\rightarrow$ `h3` $\rightarrow$ `h4`), campos com `<label for="...">` associados e `<fieldset>` com `<legend>`.
* Região viva pré-existente e vazia com `role="status"` e `aria-live="polite"`.

### **E2 — Layout Responsivo com Flexbox e Grid (CSS)**
* Abordagem **Mobile-First**: CSS base sem media queries, com breakpoints progressivos acionados por `min-width` (600px, 700px, 1024px).
* Sistema de design tokens no `:root` (paleta com contraste WCAG 2.2 AA $\ge 4.5:1$, espaçamentos modulares e raio).
* Layout do quadro em **CSS Grid** e cartões internos organizados em **Flexbox**.
* Tipografia fluida com `clamp()` e truncamento de títulos longos via `min-width: 0` e `text-overflow: ellipsis`.

### **E3 — Consumo com Fetch e os Quatro Estados da Tela (JS)**
* Migração dos dados para `dados.json` com `fetch` relativo e duas esperas (`await fetch` e `await resposta.json()`).
* Validação manual de status HTTP via `response.ok` (tratando respostas negativas que não rejeitam o `fetch`).
* Implementação dos 4 estados de tela: **carregando**, **sucesso**, **vazio** (`tarefas.length === 0`) e **erro** (discriminando `TypeError` de rede e `SyntaxError` de formato por `erro.name`).
* Atualização do DOM com `replaceChildren` e nós preenchidos estritamente com `textContent` (proteção contra XSS).

### **E4 — Estado Centralizado, Filtros Combinados e Publicação (JS)**
* **Estado canônico único:** Um único objeto `estado` guarda os fatos mutáveis (`tarefas`, `busca`, `status`, `prioridade`, `ordenacao`, `carregamento`, `erro`).
* **Derivação pura:** Função `selecionarTarefas(estado)` combina busca insensível a maiúsculas/minúsculas, filtros de status/prioridade e ordenação por prazo sem mutação de array (usando `toSorted`).
* **Ciclo unidirecional:** `Evento` $\rightarrow$ `Atualização do Estado` $\rightarrow$ `renderizarAplicacao(estado)` $\rightarrow$ `DOM Coerente`.
* Botão **"Limpar filtros"** que restaura o estado e os controles simultaneamente.
* Feedback acessível que atualiza a contagem ("N de M tarefas") no `#status` sem roubar o foco do teclado.

---

## 🛠️ Como Executar Localmente

Como a aplicação consome `dados.json` via requisições assíncronas (`fetch`), ela deve ser executada através de um servidor HTTP local:

1. **Usando a extensão Live Server (VS Code / Antigravity):**
   * Clique com o botão direito no arquivo `index.html` e selecione **"Open with Live Server"**.
2. **Ou via qualquer servidor HTTP estático local:**
   * Abra `http://localhost:5500` (ou porta configurada) no navegador.

---

**Autor:** Crispim  
**Disciplina:** Desenvolvimento Frontend - 2026.2
