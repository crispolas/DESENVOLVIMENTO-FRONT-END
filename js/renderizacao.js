/**
 * Módulo de Renderização do DOM
 * Responsabilidade: criar elementos do DOM e atualizar o quadro de tarefas.
 * Não realiza requisições e não sabe de onde vêm os dados.
 */

/**
 * Cria o elemento DOM de um cartão de tarefa mantendo a estrutura semântica da E1/E2.
 * @param {Object} tarefa - Objeto representando a tarefa.
 * @returns {HTMLLIElement} Elemento <li> contendo o <article> da tarefa.
 */
export function criarCartao(tarefa) {
  const item = document.createElement("li");

  const cartao = document.createElement("article");
  cartao.dataset.tarefaId = String(tarefa.id);

  const titulo = document.createElement("h4");
  titulo.textContent = tarefa.titulo;

  const dl = document.createElement("dl");

  const dtProjeto = document.createElement("dt");
  dtProjeto.textContent = "Projeto";
  const ddProjeto = document.createElement("dd");
  ddProjeto.textContent = tarefa.projeto || "Geral";

  const dtResponsavel = document.createElement("dt");
  dtResponsavel.textContent = "Responsável";
  const ddResponsavel = document.createElement("dd");
  ddResponsavel.textContent = tarefa.responsavel || "Não atribuído";

  // Ordem mantida estritamente igual à E1 para preservar o efeito visual do Flexbox do styles.css
  const dtPrazo = document.createElement("dt");
  dtPrazo.textContent = "Prazo";
  const ddPrazo = document.createElement("dd");
  ddPrazo.textContent = tarefa.prazo;

  const dtPrioridade = document.createElement("dt");
  dtPrioridade.textContent = "Prioridade";
  const ddPrioridade = document.createElement("dd");
  const prioridadeTexto = tarefa.prioridade
    ? tarefa.prioridade.charAt(0).toUpperCase() + tarefa.prioridade.slice(1)
    : "";
  ddPrioridade.textContent = prioridadeTexto;

  dl.append(
    dtProjeto, ddProjeto,
    dtResponsavel, ddResponsavel,
    dtPrazo, ddPrazo,
    dtPrioridade, ddPrioridade
  );

  cartao.append(titulo, dl);
  item.append(cartao);
  return item;
}

/**
 * Renderiza as tarefas no quadro, distribuindo-as pelas quatro colunas de status.
 * Utiliza replaceChildren para sincronizar o DOM sem duplicar nós.
 * @param {Array} tarefas - Lista de tarefas a exibir.
 * @param {HTMLElement} [quadro] - Contêiner do quadro com data-quadro.
 */
export function renderizarTarefas(tarefas, quadro = document.querySelector("[data-quadro]")) {
  if (!quadro) return;

  const listas = quadro.querySelectorAll("[data-lista-status]");

  listas.forEach((lista) => {
    const status = lista.dataset.listaStatus;
    const tarefasDoStatus = tarefas.filter((t) => t.status === status);
    const cartoes = tarefasDoStatus.map(criarCartao);

    lista.replaceChildren(...cartoes);
  });
}
