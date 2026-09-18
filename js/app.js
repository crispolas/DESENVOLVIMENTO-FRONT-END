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
      // Verifica aniversário após o boot terminar
      setTimeout(verificarAniversario, 1200);
    }
  }

  if (telaBoot) {
    setTimeout(encerrarBoot, 2200);
  }

  if (btnPularBoot) {
    btnPularBoot.addEventListener("click", encerrarBoot);
  }

  // ── Motor de som (Web Audio API, sem arquivos externos) ────────────────
  let audioCtx = null;

  function obterAudio() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
    }
    return audioCtx;
  }

  function tocarBeep(frequencia = 880, duracao = 0.08, tipo = "sine", volume = 0.15) {
    const ctx = obterAudio();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = tipo;
      osc.frequency.setValueAtTime(frequencia, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duracao);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duracao);
    } catch (e) { /* silencioso */ }
  }

  function tocarScanBeep() {
    tocarBeep(660, 0.06, "square", 0.1);
    setTimeout(() => tocarBeep(880, 0.06, "square", 0.08), 80);
  }

  function tocarAbertura() {
    tocarBeep(440, 0.1, "sine", 0.12);
    setTimeout(() => tocarBeep(550, 0.1, "sine", 0.1), 120);
    setTimeout(() => tocarBeep(660, 0.12, "sine", 0.12), 240);
  }

  // ── Detecção de Aniversário ─────────────────────────────────────────────
  const ANIVERSARIOS = {
    robin:    { data: "07-01", nome: "Robin" },
    ciborgue: { data: "06-29", nome: "Ciborgue" },
    mutano:   { data: "10-15", nome: "Mutano" },
    estelar:  { data: "09-17", nome: "Estelar" },
    ravena:   { data: "01-10", nome: "Ravena" }
  };

  function verificarAniversario() {
    const hoje = new Date();
    const mesHoje = String(hoje.getMonth() + 1).padStart(2, "0");
    const diaHoje = String(hoje.getDate()).padStart(2, "0");
    const chaveHoje = `${mesHoje}-${diaHoje}`;

    const aniversariante = Object.values(ANIVERSARIOS).find(a => a.data === chaveHoje);
    if (!aniversariante) return;

    const divEvento = document.getElementById("evento-aniversario");
    const nomeEl = document.getElementById("evento-aniversario-nome");
    if (!divEvento) return;

    if (nomeEl) nomeEl.textContent = `ANIVERSÁRIO D${aniversariante.nome === "Estelar" ? "A" : "O"} ${aniversariante.nome.toUpperCase()} — HOJE`;

    // Exibe com animação removendo o hidden
    divEvento.removeAttribute("hidden");
    requestAnimationFrame(() => {
      // força repaint antes de animar
      divEvento.style.display = "flex";
    });

    // Transmissão do Ciborgue muda
    const fala = document.getElementById("hud-fala-ciborgue");
    const tag  = document.getElementById("hud-operador-tag");
    if (fala) fala.textContent = `"PARABÉNS, ${aniversariante.nome.toUpperCase()}! A Torre toda está feliz com você!"`;
    if (tag)  tag.textContent  = "🎂 CIBORGUE:";

    tocarBeep(523, 0.15, "sine", 0.2);
    setTimeout(() => tocarBeep(659, 0.15, "sine", 0.15), 180);
    setTimeout(() => tocarBeep(784, 0.2, "sine", 0.18), 360);

    // Botão de fechar notificação
    const btnFecharEvento = document.getElementById("btn-fechar-evento");
    if (btnFecharEvento) {
      btnFecharEvento.addEventListener("click", () => {
        divEvento.setAttribute("hidden", "");
      });
    }
  }


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

  // ── Scan Feedback ────────────────────────────────────────────────────────
  let scanTimer = null;

  function mostrarScan(totalVisiveis) {
    const el = document.getElementById("scan-feedback");
    if (!el) return;
    clearTimeout(scanTimer);
    el.textContent = "SCANNING...";
    el.classList.add("visivel");
    tocarScanBeep();
    scanTimer = setTimeout(() => {
      el.textContent = totalVisiveis === 0
        ? "NENHUM SINAL ENCONTRADO"
        : `${totalVisiveis} OCORRÊNCIA${totalVisiveis > 1 ? "S" : ""} IDENTIFICADA${totalVisiveis > 1 ? "S" : ""}`;
      setTimeout(() => el.classList.remove("visivel"), 2000);
    }, 600);
  }

  // ── Modal do Comunicador T ───────────────────────────────────────────────

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
      tocarBeep(523, 0.08, "sine", 0.1);
      setTimeout(() => tocarBeep(659, 0.08, "sine", 0.08), 100);
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

  // Botão INICIAR VARREDURA: fecha modal e dispara scan visual
  const btnVarredura = document.getElementById("btn-iniciar-varredura");
  if (btnVarredura) {
    btnVarredura.addEventListener("click", () => {
      alternarModalFiltros(false);
      const visiveis = estado.tarefas.filter(t => {
        const buscaOk = !estado.busca || t.titulo.toLowerCase().includes(estado.busca.toLowerCase()) || (t.responsavel || "").toLowerCase().includes(estado.busca.toLowerCase()) || (t.projeto || "").toLowerCase().includes(estado.busca.toLowerCase());
        const statusOk = estado.status === "todos" || t.status === estado.status;
        const prioridadeOk = estado.prioridade === "todas" || t.prioridade === estado.prioridade;
        return buscaOk && statusOk && prioridadeOk;
      }).length;
      setTimeout(() => mostrarScan(visiveis), 250);
    });
  }


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
    tocarBeep(440, 0.06, "sine", 0.1);
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