import { carregarTarefas } from "./api.js";
import { estado } from "./estado.js";
import { renderizarAplicacao, renderizarEstado } from "./estados.js";

/**
 * Conecta todos os controles de formulário ao objeto de estado único e
 * ao ciclo centralizado de renderização (Arquitetura Unidirecional).
 */
function instalarControles() {
  // Lógica da Pokebola (Menu Lateral)
  const btnTCom = document.getElementById("btn-t-com");
  const painelLateral = document.getElementById("painel-lateral");
  
  if (btnTCom && painelLateral) {
    btnTCom.addEventListener("click", () => {
      painelLateral.classList.toggle("aberto");
    });
  }
  

  const buscaInput = document.getElementById("busca-titulo");
  const radiosStatus = document.querySelectorAll('input[name="status"]');
  const radiosPrioridade = document.querySelectorAll('input[name="prioridade"]');
  const selectOrdenacao = document.getElementById("ordenacao");
  const btnLimpar = document.getElementById("btn-limpar-filtros");
  const quadro = document.querySelector("[data-quadro]");

  // 1. Busca por título
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