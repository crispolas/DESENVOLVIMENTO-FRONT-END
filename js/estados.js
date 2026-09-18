import { renderizarTarefas } from "./renderizacao.js";
import { selecionarTarefas } from "./estado.js";

/**
 * Módulo de Gerenciamento de Estados e Sincronização da Interface
 * Responsabilidade: sincronizar a interface e a região viva a partir do estado.
 * Não realiza requisições de rede e não altera o estado.
 */

/**
 * Atualiza o texto da região acessível #status utilizando textContent.
 * Não move o foco do teclado (WCAG 2.2).
 * @param {number} totalVisiveis - Quantidade de tarefas visíveis após filtros.
 * @param {number} totalGeral - Total de tarefas cadastradas na origem.
 */
export function renderizarResumo(totalVisiveis, totalGeral) {
  const statusEl = document.getElementById("status");
  const substatusEl = document.getElementById("hud-substatus");
  const falaCiborgueEl = document.getElementById("hud-fala-ciborgue");

  if (totalGeral === 0) {
    if (statusEl) statusEl.textContent = "Nenhuma tarefa foi cadastrada.";
    if (substatusEl) substatusEl.textContent = "0 OPERATIVOS • NENHUMA OCORRÊNCIA";
    if (falaCiborgueEl) falaCiborgueEl.textContent = `"Nenhuma missão registrada no sistema."`;
  } else if (totalVisiveis === 0) {
    if (statusEl) statusEl.textContent = "Nenhuma tarefa encontrada. Altere ou limpe os critérios de filtro.";
    if (substatusEl) substatusEl.textContent = `0 DE ${totalGeral} MISSÕES ENCONTRADAS`;
    if (falaCiborgueEl) falaCiborgueEl.textContent = `"Nenhum sinal encontrado com esses parâmetros. Tente limpar os filtros!"`;
  } else {
    if (statusEl) statusEl.textContent = `${totalVisiveis} de ${totalGeral} tarefas exibidas.`;
    if (substatusEl) substatusEl.textContent = `5 OPERATIVOS CONECTADOS • ${totalVisiveis} DE ${totalGeral} OCORRÊNCIAS`;
    if (falaCiborgueEl) {
      if (totalVisiveis === totalGeral) {
        falaCiborgueEl.textContent = `"Varredura completa. ${totalVisiveis} missões ativas no radar!"`;
      } else {
        falaCiborgueEl.textContent = `"Filtro tático aplicado: ${totalVisiveis} de ${totalGeral} missões isoladas."`;
      }
    }
  }
}
//... no case "carregando":
statusEl.textContent = "Acessando banco de dados da Torre Titã...";


/**
 * Sincroniza a aplicação inteira em um único ponto de renderização:
 * 1. Deriva a lista visível sem alterar a fonte original.
 * 2. Atualiza os cartões no quadro usando replaceChildren.
 * 3. Atualiza o resumo acessível no #status.
 * @param {Object} estado - Objeto de estado canônico.
 */
export function renderizarAplicacao(estado) {
  const visiveis = selecionarTarefas(estado);
  renderizarTarefas(visiveis);
  renderizarResumo(visiveis.length, estado.tarefas.length);
}

/**
 * Controla os quatro estados fundamentais da tela durante o carregamento inicial.
 * @param {"carregando" | "sucesso" | "vazio" | "erro"} tipoEstado
 * @param {any} [dados]
 */
export function renderizarEstado(tipoEstado, dados) {
  const statusEl = document.getElementById("status");
  const quadro = document.querySelector("[data-quadro]");

  switch (tipoEstado) {
    case "carregando":
      if (statusEl) statusEl.textContent = "Carregando tarefas...";
      if (quadro) renderizarTarefas([], quadro);
      break;

    case "sucesso":
      if (statusEl && Array.isArray(dados)) {
        statusEl.textContent = `${dados.length} de ${dados.length} tarefas exibidas.`;
      }
      if (quadro && Array.isArray(dados)) {
        renderizarTarefas(dados, quadro);
      }
      break;

    case "vazio":
      if (statusEl) statusEl.textContent = "Nenhuma tarefa foi cadastrada.";
      if (quadro) renderizarTarefas([], quadro);
      break;

    case "erro":
      if (statusEl) {
        const mensagem = typeof dados === "string" 
          ? dados 
          : (dados?.mensagem || "Ocorreu um erro ao carregar as tarefas.");
        statusEl.textContent = mensagem;
      }
      if (quadro) renderizarTarefas([], quadro);
      break;
  }
}


