import { carregarTarefas } from "./api.js";
import { estado } from "./estado.js";
import { renderizarAplicacao, renderizarEstado } from "./estados.js";

/**
 * Conecta todos os controles de formulário ao objeto de estado único e
 * ao ciclo centralizado de renderização (Arquitetura Unidirecional).
 */
function instalarControles() {
  const buscaInput = document.getElementById("busca-titulo");
  const radiosStatus = document.querySelectorAll('input[name="status"]');
  const radiosPrioridade = document.querySelectorAll('input[name="prioridade"]');
  const selectOrdenacao = document.getElementById("ordenacao");
  const btnLimpar = document.getElementById("btn-limpar-filtros");
  const quadro = document.querySelector("[data-quadro]");

  // 0. Botão Comunicador em 'T': abre e fecha o Popup Modal de Gerenciamento
  const btnComunicador = document.getElementById("btn-comunicador");
  const modalOverlay = document.getElementById("modal-filtros-overlay");
  const btnFecharModal = document.getElementById("btn-fechar-modal");

  function alternarModalFiltros(forcarAberto) {
    if (!modalOverlay || !btnComunicador) return;
    const deveAbrir = forcarAberto !== undefined
      ? forcarAberto
      : !modalOverlay.classList.contains("ativo");

    modalOverlay.classList.toggle("ativo", deveAbrir);
    btnComunicador.setAttribute("aria-expanded", String(deveAbrir));
    modalOverlay.setAttribute("aria-hidden", String(!deveAbrir));

    if (deveAbrir) {
      if (buscaInput) buscaInput.focus();
    } else {
      btnComunicador.focus();
    }
  }

  if (btnComunicador) {
    btnComunicador.addEventListener("click", () => alternarModalFiltros());
  }

  if (btnFecharModal) {
    btnFecharModal.addEventListener("click", () => alternarModalFiltros(false));
  }

  if (modalOverlay) {
    modalOverlay.addEventListener("click", (evento) => {
      if (evento.target === modalOverlay) {
        alternarModalFiltros(false);
      }
    });
  }

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && modalOverlay?.classList.contains("ativo")) {
      alternarModalFiltros(false);
    }
  });

  // 1. Busca por título: evento input (acompanha a digitação)
  if (buscaInput) {
    buscaInput.addEventListener("input", (evento) => {
      estado.busca = evento.currentTarget.value;
      renderizarAplicacao(estado);
    });
  }

  // 2. Filtro por status
  radiosStatus.forEach((radio) => {
    radio.addEventListener("change", (evento) => {
      if (evento.currentTarget.checked) {
        estado.status = evento.currentTarget.value;
        renderizarAplicacao(estado);
      }
    });
  });

  // 3. Filtro por prioridade
  radiosPrioridade.forEach((radio) => {
    radio.addEventListener("change", (evento) => {
      if (evento.currentTarget.checked) {
        estado.prioridade = evento.currentTarget.value;
        renderizarAplicacao(estado);
      }
    });
  });

  // 4. Ordenação por prazo
  if (selectOrdenacao) {
    selectOrdenacao.addEventListener("change", (evento) => {
      estado.ordenacao = evento.currentTarget.value;
      renderizarAplicacao(estado);
    });
  }

  // 5. Botão "Limpar filtros"
  if (btnLimpar) {
    btnLimpar.addEventListener("click", () => {
      estado.busca = "";
      estado.status = "todos";
      estado.prioridade = "todas";
      estado.ordenacao = "prazo-asc";

      if (buscaInput) buscaInput.value = "";
      const radioStatusTodos = document.getElementById("status-todos");
      if (radioStatusTodos) radioStatusTodos.checked = true;
      const radioPrioridadeTodas = document.getElementById("prioridade-todas");
      if (radioPrioridadeTodas) radioPrioridadeTodas.checked = true;
      if (selectOrdenacao) selectOrdenacao.value = "prazo-asc";

      const btnEventoEstelar = document.getElementById("btn-evento-estelar");
      if (btnEventoEstelar) {
        btnEventoEstelar.textContent = "⚡ Ver Missões da Estelar ❯";
      }

      // Dispara o ciclo de renderização
      renderizarAplicacao(estado);
    });
  }

  // 6. Delegação de eventos no quadro
  if (quadro) {
    quadro.addEventListener("click", (evento) => {
      if (!(evento.target instanceof Element)) return;
      const cartao = evento.target.closest("[data-tarefa-id]");
      if (!cartao || !quadro.contains(cartao)) return;

      const tarefaId = cartao.dataset.tarefaId;
      const tarefa = estado.tarefas.find((t) => String(t.id) === tarefaId);
      if (tarefa) {
        console.log("Detalhes da carta clicada:", tarefa);
      }
    });
  }

  // 7. Alerta do Calendário Social: Interação com Aniversário da Estelar
  const btnEventoEstelar = document.getElementById("btn-evento-estelar");
  if (btnEventoEstelar) {
    btnEventoEstelar.addEventListener("click", () => {
      const falaCiborgue = document.getElementById("hud-fala-ciborgue");
      if (estado.busca === "Estelar") {
        estado.busca = "";
        if (buscaInput) buscaInput.value = "";
        if (falaCiborgue) {
          falaCiborgue.textContent = `"Exibindo todas as operações táticas da Torre."`;
        }
        btnEventoEstelar.textContent = "⚡ Ver Missões da Estelar ❯";
      } else {
        estado.busca = "Estelar";
        if (buscaInput) buscaInput.value = "Estelar";
        if (falaCiborgue) {
          falaCiborgue.textContent = `"Filtrando missões da aniversariante Estelar! 🎂"`;
        }
        btnEventoEstelar.textContent = "✕ Limpar Filtro da Estelar";
      }
      renderizarAplicacao(estado);
    });
  }
}

async function inicializar() {
  estado.carregamento = "carregando";
  renderizarEstado("carregando");

  try {
    const dados = await carregarTarefas();
    estado.tarefas = dados;
    estado.carregamento = "sucesso";

    instalarControles();
    renderizarAplicacao(estado);
  } catch (erro) {
    estado.carregamento = "erro";
    estado.erro = erro;
    let mensagem = "Erro inesperado ao carregar as tarefas.";
    renderizarEstado("erro", { mensagem });
  }
}

document.addEventListener("DOMContentLoaded", inicializar);