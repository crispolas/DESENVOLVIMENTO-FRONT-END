/**
 * Módulo de Acesso a Dados (API)
 * Responsabilidade: buscar os dados no arquivo dados.json e validar a resposta HTTP.
 * Não realiza manipulação de DOM (separação de responsabilidades).
 */

/**
 * Busca e devolve o array de tarefas a partir de dados.json.
 * @returns {Promise<Array>} Promessa com o array de tarefas.
 * @throws {Error} Lança erro caso a resposta HTTP não seja ok (status fora de 200-299).
 */
export async function carregarTarefas() {
  const resposta = await fetch("./dados.json");

  if (!resposta.ok) {
    throw new Error(`Resposta HTTP ${resposta.status}`);
  }

  const documento = await resposta.json();
  return documento.alvos; // Agora o json chama "alvos" em vez de tarefas
}



