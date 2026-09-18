/**
 * Módulo de Renderização do DOM — Estilo Trello Torre dos Titãs
 * Responsabilidade: criar elementos do DOM e atualizar o quadro de tarefas.
 * Utiliza exclusivamente createElement e textContent para segurança contra XSS.
 */

/**
 * Cria o elemento DOM de um cartão de tarefa com tags e avatar do Titã.
 * @param {Object} tarefa - Objeto representando a tarefa.
 * @returns {HTMLLIElement} Elemento <li> contendo o <article> da tarefa.
 */
export function criarCartao(tarefa) {
  const item = document.createElement("li");
  item.style.width = "100%";

  const rotClasse = `rot-${((tarefa.id - 1) % 4) + 1}`;
  const cartao = document.createElement("article");
  cartao.className = `cartao ficha-magnetica ${rotClasse} status-${tarefa.status}`;
  cartao.dataset.tarefaId = String(tarefa.id);

  // 1. Topo: Código Tático e Prioridade
  const topo = document.createElement("div");
  topo.className = "cartao-tags";

  const tagProjeto = document.createElement("span");
  tagProjeto.className = "tag-projeto";
  // Tag de operação tática estilizada
  const codigoOperacao = tarefa.projeto 
    ? `#OP-${tarefa.projeto.toUpperCase().replace(/\s+/g, "-")}`
    : `#T-00${tarefa.id}`;
  tagProjeto.textContent = codigoOperacao;

  const tagPrioridade = document.createElement("span");
  tagPrioridade.className = `tag-prioridade prioridade-${tarefa.prioridade}`;
  const prioridadeMap = {
    alta: "URGENTE",
    media: "MÉDIA",
    baixa: "BAIXA"
  };
  tagPrioridade.textContent = prioridadeMap[tarefa.prioridade] || tarefa.prioridade.toUpperCase();

  topo.append(tagProjeto, tagPrioridade);

  // 2. Centro: Título da Tarefa / Missão
  const titulo = document.createElement("h4");
  titulo.className = "cartao-titulo";
  titulo.textContent = tarefa.titulo;

  // 3. Base: Data de Transmissão / Prazo e Avatar do Titã responsável
  const rodape = document.createElement("footer");
  rodape.className = "cartao-rodape";

  const prazo = document.createElement("span");
  prazo.className = "cartao-prazo";
  prazo.textContent = `PRAZO ${tarefa.prazo}`;

  const avatar = document.createElement("img");
  avatar.className = "avatar-responsavel";
  if (tarefa.responsavel) {
    const slug = tarefa.responsavel.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    avatar.classList.add(`avatar-${slug}`);
  }
  avatar.src = tarefa.avatar || "img/robin.png";
  avatar.alt = `Avatar de ${tarefa.responsavel}`;
  avatar.title = `Titã Responsável: ${tarefa.responsavel}`;

  rodape.append(prazo, avatar);

  // Montagem do cartão
  cartao.append(topo, titulo, rodape);
  item.append(cartao);
  
  return item;
}

/**
 * Renderiza as tarefas no quadro distribuindo pelas 4 colunas de status.
 * Utiliza replaceChildren para sincronização atômica sem duplicar cartões.
 * @param {Array} tarefas - Lista de tarefas a exibir.
 * @param {HTMLElement} [quadro] - Contêiner do quadro com data-quadro.
 */
export function renderizarTarefas(tarefas, quadro = document.querySelector("[data-quadro]")) {
  if (!quadro) return;
  const listas = quadro.querySelectorAll("[data-lista-status]");
  listas.forEach((lista) => {
    const status = lista.dataset.listaStatus;
    const alvosDoStatus = alvos.filter((a) => a.status === status);
    const cartoes = alvosDoStatus.map(criarCartao);
    lista.replaceChildren(...cartoes);
  });
}