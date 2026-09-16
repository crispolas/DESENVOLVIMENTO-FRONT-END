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

  // 1. Busca por título: evento input (acompanha a digitação)
  if (buscaInput) {
    buscaInput.addEventListener("input", (evento) => {
      estado.busca = evento.currentTarget.value;
      renderizarAplicacao(estado);
    });
  }

  // 2. Filtro por status: evento change em cada opção de rádio
  radiosStatus.forEach((radio) => {
    radio.addEventListener("change", (evento) => {
      if (evento.currentTarget.checked) {
        estado.status = evento.currentTarget.value;
        renderizarAplicacao(estado);
      }
    });
  });

  // 3. Filtro por prioridade: evento change em cada opção de rádio
  radiosPrioridade.forEach((radio) => {
    radio.addEventListener("change", (evento) => {
      if (evento.currentTarget.checked) {
        estado.prioridade = evento.currentTarget.value;
        renderizarAplicacao(estado);
      }
    });
  });

  // 4. Ordenação por prazo: evento change
  if (selectOrdenacao) {
    selectOrdenacao.addEventListener("change", (evento) => {
      estado.ordenacao = evento.currentTarget.value;
      renderizarAplicacao(estado);
    });
  }

  // 5. Botão "Limpar filtros": restaura o estado e os controles do formulário
  if (btnLimpar) {
    btnLimpar.addEventListener("click", () => {
      // Restaura valores canônicos do estado
      estado.busca = "";
      estado.status = "todos";
      estado.prioridade = "todas";
      estado.ordenacao = "prazo-asc";

      // Sincroniza os controles visuais no DOM
      if (buscaInput) buscaInput.value = "";
      
      const radioStatusTodos = document.getElementById("status-todos");
      if (radioStatusTodos) radioStatusTodos.checked = true;

      const radioPrioridadeTodas = document.getElementById("prioridade-todas");
      if (radioPrioridadeTodas) radioPrioridadeTodas.checked = true;

      if (selectOrdenacao) selectOrdenacao.value = "prazo-asc";

      // Dispara o ciclo de renderização
      renderizarAplicacao(estado);
    });
  }

  // 6. Delegação de eventos no quadro: sobrevive a novas renderizações sem duplicar
  if (quadro) {
    quadro.addEventListener("click", (evento) => {
      if (!(evento.target instanceof Element)) return;
      const cartao = evento.target.closest("[data-tarefa-id]");
      if (!cartao || !quadro.contains(cartao)) return;

      const tarefaId = cartao.dataset.tarefaId;
      const tarefa = estado.tarefas.find((t) => String(t.id) === tarefaId);
      if (tarefa) {
        console.log("Detalhes da tarefa:", tarefa);
      }
    });
  }
}

/**
 * Ponto de entrada da aplicação.
 * Orquestra o carregamento inicial dos dados e a inicialização dos controles.
 * Nenhum await de nível superior: a execução acontece dentro desta função assíncrona.
 */
async function inicializar() {
  estado.carregamento = "carregando";
  renderizarEstado("carregando");

  try {
    const dados = await carregarTarefas();
    estado.tarefas = dados;
    estado.carregamento = "sucesso";

    // Instala os ouvintes de evento uma única vez
    instalarControles();

    // Renderiza a aplicação completa a partir do estado inicial
    renderizarAplicacao(estado);
  } catch (erro) {
    estado.carregamento = "erro";
    estado.erro = erro;

    let mensagem = "Erro inesperado ao carregar as tarefas.";
    if (erro.name === "TypeError") {
      mensagem = "Erro de rede: não foi possível carregar as tarefas. Verifique sua conexão.";
    } else if (erro.name === "SyntaxError") {
      mensagem = "Erro de formato: o arquivo de dados contém JSON inválido.";
    } else if (erro.message && erro.message.startsWith("Resposta HTTP")) {
      mensagem = `Erro de protocolo: o servidor respondeu com ${erro.message}.`;
    } else {
      mensagem = `Erro ao carregar dados: ${erro.message}`;
    }

    renderizarEstado("erro", { mensagem });
  }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", inicializar);
