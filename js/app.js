import { carregarTarefas } from "./api.js";
import { renderizarEstado } from "./estados.js";

/**
 * Ponto de entrada da aplicação.
 * Orquestra o ciclo de vida inicial, os quatro estados e o tratamento de falhas por tipo.
 * Nenhum await de nível superior: a execução ocorre dentro de uma função assíncrona.
 */
async function inicializar() {
  // 1. O estado de carregando é aplicado antes do await, não depois
  renderizarEstado("carregando");

  try {
    const tarefas = await carregarTarefas();

    // 2. O estado de vazio é alcançado por tarefas.length === 0 e não pelo catch
    if (!tarefas || tarefas.length === 0) {
      renderizarEstado("vazio");
    } else {
      // 3. O estado de sucesso renderiza os cartões e informa quantos são
      renderizarEstado("sucesso", tarefas);
    }
  } catch (erro) {
    // 4. O catch distingue pelo menos rede (TypeError) e formato (SyntaxError) por erro.name
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

    // 5. O estado de erro exibe mensagem na tela, não apenas no console
    renderizarEstado("erro", { mensagem });
  }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", inicializar);
