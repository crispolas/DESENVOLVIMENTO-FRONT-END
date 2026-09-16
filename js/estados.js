import { renderizarTarefas } from "./renderizacao.js";

/**
 * Módulo de Gerenciamento de Estados da Interface
 * Responsabilidade: decidir qual dos quatro estados da tela está ativo.
 * Não realiza requisições de rede (separação estrita de responsabilidades).
 * 
 * @param {"carregando" | "sucesso" | "vazio" | "erro"} estado - Estado atual da interface.
 * @param {Array|Object|string} [dados] - Dados associados ao estado (tarefas ou mensagem de erro).
 */
export function renderizarEstado(estado, dados) {
  const statusEl = document.getElementById("status");
  const quadro = document.querySelector("[data-quadro]");

  switch (estado) {
    case "carregando":
      if (statusEl) {
        statusEl.textContent = "Carregando tarefas...";
      }
      if (quadro) {
        renderizarTarefas([], quadro);
      }
      break;

    case "sucesso":
      if (statusEl && Array.isArray(dados)) {
        statusEl.textContent = `${dados.length} tarefas carregadas com sucesso.`;
      }
      if (quadro && Array.isArray(dados)) {
        renderizarTarefas(dados, quadro);
      }
      break;

    case "vazio":
      if (statusEl) {
        statusEl.textContent = "Nenhuma tarefa encontrada.";
      }
      if (quadro) {
        renderizarTarefas([], quadro);
      }
      break;

    case "erro":
      if (statusEl) {
        const mensagem = typeof dados === "string" 
          ? dados 
          : (dados?.mensagem || "Ocorreu um erro ao carregar as tarefas.");
        statusEl.textContent = mensagem;
      }
      if (quadro) {
        renderizarTarefas([], quadro);
      }
      break;
  }
}

