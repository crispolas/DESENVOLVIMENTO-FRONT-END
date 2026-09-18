import { carregarTarefas } from "./api.js";
import { estado } from "./estado.js";
import { renderizarAplicacao, renderizarEstado } from "./estados.js";

/**
 * Conecta todos os controles de formulário, modais, telemetria e botões táticos
 * ao objeto de estado único e ao ciclo centralizado de renderização (Arquitetura Unidirecional).
 */
function instalarControles() {
  const buscaInput = document.getElementById("busca-titulo");
  const radiosStatus = document.querySelectorAll('input[name="status"]');
  const radiosPrioridade = document.querySelectorAll('input[name="prioridade"]');
  const selectOrdenacao = document.getElementById("ordenacao");
  const btnLimpar = document.getElementById("btn-limpar-filtros");
  const quadro = document.querySelector("[data-quadro]");

  // 1. Sequência de Inicialização (Boot Sequence)
  const telaBoot = document.getElementById("tela-boot");
  const btnPularBoot = document.getElementById("btn-pular-boot");

  function encerrarBoot() {
    if (telaBoot && !telaBoot.classList.contains("oculto")) {
      telaBoot.classList.add("oculto");
    }
  }

  if (telaBoot) {
    // Encerra automaticamente após 2.2 segundos de animação
    setTimeout(encerrarBoot, 2200);
  }

  if (btnPularBoot) {
    btnPularBoot.addEventListener("click", encerrarBoot);
  }

  // 2. Modo de Emergência (Titans Alert)
  const btnAlertaEmergencia = document.getElementById("btn-alerta-emergencia");
  const operadorTag = document.getElementById("hud-operador-tag");
  const falaCiborgue = document.getElementById("hud-fala-ciborgue");

  if (btnAlertaEmergencia) {
    btnAlertaEmergencia.addEventListener("click", () => {
      const estaAtivo = document.body.classList.toggle("alerta-emergencia-ativo");

      if (estaAtivo) {
        if (operadorTag) operadorTag.textContent = "🚨 ROBIN:";
        if (falaCiborgue) {
          falaCiborgue.textContent = `"ALERTA VERMELHO! Ocorrência crítica em Jump City! Todos os Titãs aos seus postos!"`;
        }
        btnAlertaEmergencia.querySelector(".texto-alerta-btn").textContent = "CANCELAR ALERTA";
      } else {
        if (operadorTag) operadorTag.textContent = "⚡ CIBORGUE:";
        if (falaCiborgue) {
          falaCiborgue.textContent = `"SISTEMA ESTABILIZADO. A Torre está segura e sob controle."`;
        }
        btnAlertaEmergencia.querySelector(".texto-alerta-btn").textContent = "ALERTA TITÃS";
      }
    });
  }

  // 3. Modal do Comunicador T (Filtros e Busca)
  const btnComunicador = document.getElementById("btn-comunicador");
  const modalFiltrosOverlay = document.getElementById("modal-filtros-overlay");
  const btnFecharModal = document.getElementById("btn-fechar-modal");

  function alternarModalFiltros(forcarAberto) {
    if (!modalFiltrosOverlay || !btnComunicador) return;
    const deveAbrir = forcarAberto !== undefined
      ? forcarAberto
      : !modalFiltrosOverlay.classList.contains("ativo");

    modalFiltrosOverlay.classList.toggle("ativo", deveAbrir);
    btnComunicador.setAttribute("aria-expanded", String(deveAbrir));
    modalFiltrosOverlay.setAttribute("aria-hidden", String(!deveAbrir));

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

  if (modalFiltrosOverlay) {
    modalFiltrosOverlay.addEventListener("click", (evento) => {
      if (evento.target === modalFiltrosOverlay) {
        alternarModalFiltros(false);
      }
    });
  }

  // 4. Modal de Dossiê da Missão (Ao Clicar no Card)
  const modalDossieOverlay = document.getElementById("modal-dossie-overlay");
  const btnFecharDossie = document.getElementById("btn-fechar-dossie");
  const btnFecharDossieSec = document.getElementById("btn-fechar-dossie-secundario");

  function abrirDossie(tarefa) {
    if (!modalDossieOverlay || !tarefa) return;

    const elCodigo = document.getElementById("dossie-codigo");
    const elTitulo = document.getElementById("dossie-titulo");
    const elAvatar = document.getElementById("dossie-avatar");
    const elHeroi = document.getElementById("dossie-heroi");
    const elStatus = document.getElementById("dossie-status-tag");
    const elProjeto = document.getElementById("dossie-projeto");
    const elPrioridade = document.getElementById("dossie-prioridade");
    const elPrazo = document.getElementById("dossie-prazo");

    const statusFormatado = {
      "a-fazer": "SINAIS NO RADAR // A FAZER",
      "em-andamento": "EM OPERAÇÃO ATIVA",
      "em-revisao": "EM ANÁLISE // SCANNER",
      "concluida": "ARQUIVO DE MISSÕES // CONCLUÍDO"
    }[tarefa.status] || tarefa.status;

    if (elCodigo) elCodigo.textContent = tarefa.projeto ? `#OP-${tarefa.projeto.toUpperCase().replace(/\s+/g, "-")}` : `#T-00${tarefa.id}`;
    if (elTitulo) elTitulo.textContent = tarefa.titulo;
    if (elAvatar) elAvatar.src = tarefa.avatar || "img/robin.png";
    if (elHeroi) elHeroi.textContent = tarefa.responsavel || "Titã Não Identificado";
    if (elStatus) elStatus.textContent = statusFormatado;
    if (elProjeto) elProjeto.textContent = tarefa.projeto || "Torre dos Titãs";
    if (elPrioridade) elPrioridade.textContent = (tarefa.prioridade || "MÉDIA").toUpperCase();
    if (elPrazo) elPrazo.textContent = tarefa.prazo;

    modalDossieOverlay.classList.add("ativo");
    modalDossieOverlay.setAttribute("aria-hidden", "false");
    if (btnFecharDossie) btnFecharDossie.focus();
  }

  function fecharDossie() {
    if (modalDossieOverlay) {
      modalDossieOverlay.classList.remove("ativo");
      modalDossieOverlay.setAttribute("aria-hidden", "true");
    }
  }

  if (btnFecharDossie) btnFecharDossie.addEventListener("click", fecharDossie);
  if (btnFecharDossieSec) btnFecharDossieSec.addEventListener("click", fecharDossie);
  if (modalDossieOverlay) {
    modalDossieOverlay.addEventListener("click", (e) => {
      if (e.target === modalDossieOverlay) fecharDossie();
    });
  }

  // Tecla Escape fecha qualquer modal aberto
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      if (modalDossieOverlay?.classList.contains("ativo")) {
        fecharDossie();
      } else if (modalFiltrosOverlay?.classList.contains("ativo")) {
        alternarModalFiltros(false);
      }
    }
  });

  // 5. Botões do Roster de Titãs (Filtro por Herói)
  const botoesRoster = document.querySelectorAll(".btn-roster");
  botoesRoster.forEach((btn) => {
    btn.addEventListener("click", () => {
      const heroi = btn.dataset.heroi || "";
      botoesRoster.forEach((b) => b.classList.toggle("ativo", b === btn));

      estado.busca = heroi;
      if (buscaInput) buscaInput.value = heroi;

      if (falaCiborgue) {
        if (!heroi) {
          falaCiborgue.textContent = `"Exibindo todas as operações táticas da Torre."`;
        } else {
          falaCiborgue.textContent = `"Isolando ocorrências do operativo ${heroi} no radar."`;
        }
      }

      renderizarAplicacao(estado);
    });
  });

  // 6. Busca por título / herói / operação: evento input
  if (buscaInput) {
    buscaInput.addEventListener("input", (evento) => {
      estado.busca = evento.currentTarget.value;
      // Atualiza estado visual dos botões do roster
      botoesRoster.forEach((b) => {
        const h = b.dataset.heroi || "";
        b.classList.toggle("ativo", h && estado.busca.toLowerCase().includes(h.toLowerCase()));
      });
      renderizarAplicacao(estado);
    });
  }

  // 7. Filtro por status
  radiosStatus.forEach((radio) => {
    radio.addEventListener("change", (evento) => {
      if (evento.currentTarget.checked) {
        estado.status = evento.currentTarget.value;
        renderizarAplicacao(estado);
      }
    });
  });

  // 8. Filtro por prioridade
  radiosPrioridade.forEach((radio) => {
    radio.addEventListener("change", (evento) => {
      if (evento.currentTarget.checked) {
        estado.prioridade = evento.currentTarget.value;
        renderizarAplicacao(estado);
      }
    });
  });

  // 9. Ordenação por prazo
  if (selectOrdenacao) {
    selectOrdenacao.addEventListener("change", (evento) => {
      estado.ordenacao = evento.currentTarget.value;
      renderizarAplicacao(estado);
    });
  }

  // 10. Botão "Limpar filtros"
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

      // Reseta botões do roster
      botoesRoster.forEach((b) => {
        b.classList.toggle("ativo", b.classList.contains("btn-roster-todos"));
      });

      if (falaCiborgue) {
        falaCiborgue.textContent = `"Filtros resetados. 8 missões ativas na varredura."`;
      }

      renderizarAplicacao(estado);
    });
  }

  // 11. Delegação de cliques no quadro para abrir o Dossiê
  if (quadro) {
    quadro.addEventListener("click", (evento) => {
      if (!(evento.target instanceof Element)) return;
      const cartao = evento.target.closest("[data-tarefa-id]");
      if (!cartao || !quadro.contains(cartao)) return;

      const tarefaId = cartao.dataset.tarefaId;
      const tarefa = estado.tarefas.find((t) => String(t.id) === tarefaId);
      if (tarefa) {
        abrirDossie(tarefa);
      }
    });

    quadro.addEventListener("keydown", (evento) => {
      if (evento.key === "Enter" || evento.key === " ") {
        const cartao = evento.target.closest("[data-tarefa-id]");
        if (cartao && quadro.contains(cartao)) {
          evento.preventDefault();
          const tarefaId = cartao.dataset.tarefaId;
          const tarefa = estado.tarefas.find((t) => String(t.id) === tarefaId);
          if (tarefa) {
            abrirDossie(tarefa);
          }
        }
      }
    });
  }
}

/**
 * Ponto de entrada da aplicação.
 * Orquestra o carregamento inicial dos dados e a inicialização dos controles.
 */
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

document.addEventListener("DOMContentLoaded", inicializar);