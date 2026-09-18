/**
 * Módulo de Renderização do DOM — Computador Central dos Jovens Titãs
 * Responsabilidade: criar elementos do DOM e atualizar o quadro de tarefas.
 * Utiliza exclusivamente createElement e textContent para segurança contra XSS.
 */

/**
 * Cria o elemento DOM de um cartão de tarefa com formato de Dossiê Tático.
 * @param {Object} tarefa - Objeto representando a tarefa.
 * @returns {HTMLLIElement} Elemento <li> contendo o <article> da tarefa.
 */
export function criarCartao(tarefa) {
  const item = document.createElement("li");
  item.className = "item-missao-li";

  const rotClasse = `rot-${((tarefa.id - 1) % 4) + 1}`;
  const cartao = document.createElement("article");
  cartao.className = `cartao ficha-magnetica ${rotClasse} status-${tarefa.status} prioridade-${tarefa.prioridade}`;
  cartao.dataset.tarefaId = String(tarefa.id);
  cartao.tabIndex = 0;
  cartao.setAttribute("role", "button");
  cartao.setAttribute("aria-label", `Abrir dossiê da missão: ${tarefa.titulo}`);

  // 1. Topo: Código Tático e Prioridade
  const topo = document.createElement("div");
  topo.className = "cartao-tags";

  const blocoCodigo = document.createElement("div");
  blocoCodigo.className = "cartao-codigo-bloco";

  const dot = document.createElement("span");
  dot.className = "cartao-dot-pulso";

  const tagProjeto = document.createElement("span");
  tagProjeto.className = "tag-projeto";
  const codigoOperacao = tarefa.projeto 
    ? `#OP-${tarefa.projeto.toUpperCase().replace(/\s+/g, "-")}`
    : `#T-00${tarefa.id}`;
  tagProjeto.textContent = codigoOperacao;

  blocoCodigo.append(dot, tagProjeto);

  const tagPrioridade = document.createElement("span");
  tagPrioridade.className = `tag-prioridade prioridade-${tarefa.prioridade}`;
  const prioridadeMap = {
    alta: "URGENTE // CRÍTICO",
    media: "MÉDIA PRIORIDADE",
    baixa: "BAIXA PRIORIDADE"
  };
  tagPrioridade.textContent = prioridadeMap[tarefa.prioridade] || tarefa.prioridade.toUpperCase();

  topo.append(blocoCodigo, tagPrioridade);

  // 2. Centro: Título da Tarefa / Missão
  const titulo = document.createElement("h4");
  titulo.className = "cartao-titulo";
  titulo.textContent = tarefa.titulo;

  // 3. Base: Data de Transmissão / Prazo e Avatar do Titã responsável
  const rodape = document.createElement("footer");
  rodape.className = "cartao-rodape";

  const blocoMeta = document.createElement("div");
  blocoMeta.className = "cartao-meta-info";

  const prazo = document.createElement("span");
  prazo.className = "cartao-prazo";
  prazo.textContent = `LIMITE: ${tarefa.prazo}`;

  const btnAcessar = document.createElement("span");
  btnAcessar.className = "btn-ver-dossie";
  btnAcessar.textContent = "VER DOSSIÊ ❯";

  blocoMeta.append(prazo, btnAcessar);

  const avatar = document.createElement("img");
  avatar.className = "avatar-responsavel";
  if (tarefa.responsavel) {
    const slug = tarefa.responsavel.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    avatar.classList.add(`avatar-${slug}`);
  }
  avatar.src = tarefa.avatar || "img/robin.png";
  avatar.alt = `Avatar de ${tarefa.responsavel}`;
  avatar.title = `Titã Responsável: ${tarefa.responsavel}`;

  rodape.append(blocoMeta, avatar);

  // Elementos do Micro-Scanner Tático Holográfico (Hover Feedback)
  const scanLinha = document.createElement("div");
  scanLinha.className = "cartao-scan-linha";
  scanLinha.setAttribute("aria-hidden", "true");

  const scanFeedback = document.createElement("div");
  scanFeedback.className = "cartao-scan-feedback";
  scanFeedback.setAttribute("aria-hidden", "true");

  const scanFeedbackTexto = document.createElement("span");
  scanFeedbackTexto.className = "scan-feedback-texto";
  scanFeedbackTexto.textContent = "BIO-SCAN STANDBY";
  scanFeedback.appendChild(scanFeedbackTexto);

  // Montagem do cartão com elementos holográficos
  cartao.append(scanLinha, topo, scanFeedback, titulo, rodape);
  item.append(cartao);
  return item;
}

/**
 * Renderiza as tarefas no quadro distribuindo pelas 4 seções de status.
 * Utiliza replaceChildren para sincronização atômica sem duplicar cartões.
 * @param {Array} tarefas - Lista de tarefas a exibir.
 * @param {HTMLElement} [quadro] - Contêiner do quadro com data-quadro.
 */
export function renderizarTarefas(tarefas, quadro = document.querySelector("[data-quadro]")) {
  if (!quadro) return;
  const listas = quadro.querySelectorAll("[data-lista-status]");
  listas.forEach((lista) => {
    const status = lista.dataset.listaStatus;
    const tarefasDoStatus = (tarefas || []).filter((t) => t.status === status);
    const cartoes = tarefasDoStatus.map(criarCartao);
    lista.replaceChildren(...cartoes);
  });
}