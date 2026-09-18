/**
 * Módulo de Estado da Aplicação e Derivação de Dados
 * Responsabilidade: manter o estado canônico único da aplicação e
 * prover a função seletora pura que calcula a lista visível.
 *
 * Princípios:
 * - Não toca no DOM.
 * - Não realiza requisições de rede.
 * - Não causa efeitos colaterais na fonte de dados (sem mutações diretas).
 */

/**
 * Objeto de estado único da aplicação.
 * Representa os fatos mutáveis que governam a interface.
 */
export const estado = {
  tarefas: [],
  busca: "",
  status: "todos",
  prioridade: "todas",
  ordenacao: "prazo-asc",
  carregamento: "carregando",
  erro: null,
};

/**
 * Converte data no formato "DD/MM/AAAA" para string comparável "AAAA-MM-DD".
 * @param {string} prazo - Data no formato brasileiro.
 * @returns {string} Data em formato ISO simplificado.
 */
function normalizarData(prazo) {
  if (!prazo || typeof prazo !== "string") return "";
  const partes = prazo.split("/");
  if (partes.length === 3) {
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  }
  return prazo;
}

/**
 * Função seletora pura que deriva a lista visível de tarefas
 * combinando busca por título, filtro por status, filtro por prioridade
 * e ordenação por prazo.
 *
 * Não altera estado.tarefas e não consulta o DOM.
 *
 * @param {typeof estado} estadoAtual - Objeto de estado canônico.
 * @returns {Array} Novo array com as tarefas visíveis filtradas e ordenadas.
 */
export function selecionarTarefas(estadoAtual) {
  const termo = estadoAtual.busca.trim().toLowerCase();

  // 1. Filtragem combinada sobre a fonte original
  const filtradas = estadoAtual.tarefas.filter((tarefa) => {
    const atendeBusca = !termo || 
      tarefa.titulo.toLowerCase().includes(termo) ||
      (tarefa.responsavel && tarefa.responsavel.toLowerCase().includes(termo)) ||
      (tarefa.projeto && tarefa.projeto.toLowerCase().includes(termo));
    const atendeStatus = estadoAtual.status === "todos" || tarefa.status === estadoAtual.status;
    const atendePrioridade = estadoAtual.prioridade === "todas" || tarefa.prioridade === estadoAtual.prioridade;

    return atendeBusca && atendeStatus && atendePrioridade;
  });

  // 2. Ordenação sem efeitos colaterais (toSorted ou cópia por spread)
  const compararPrazo = (a, b) => {
    const dataA = normalizarData(a.prazo);
    const dataB = normalizarData(b.prazo);

    if (estadoAtual.ordenacao === "prazo-desc") {
      return dataB.localeCompare(dataA);
    }
    return dataA.localeCompare(dataB);
  };

  if (typeof filtradas.toSorted === "function") {
    return filtradas.toSorted(compararPrazo);
  }
  return [...filtradas].sort(compararPrazo);
}
