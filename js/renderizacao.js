export function criarCartao(alvo) {
  const item = document.createElement("li");
  item.style.width = "100%";

  const cartao = document.createElement("article");
  cartao.className = "dossie";
  cartao.dataset.alvoId = String(alvo.id);

  // A tachinha no topo da foto
  const tachinha = document.createElement("div");
  tachinha.className = "tachinha";

  // Carimbo de Ameaça (Classe A, B ou C)
  const carimbo = document.createElement("div");
  carimbo.className = `carimbo-ameaca ${alvo.prioridade}`;
  carimbo.textContent = alvo.prioridade.replace("-", " ").toUpperCase();

  // Foto (Área Escura com o Nome do Vilão)
  const foto = document.createElement("div");
  foto.className = "foto-vilao";
  foto.textContent = alvo.titulo.toUpperCase();

  // Área das anotações
  const anotacoes = document.createElement("div");
  anotacoes.className = "dados-dossie";
  
  const pProjeto = document.createElement("p");
  pProjeto.innerHTML = `<strong>Atividade:</strong> ${alvo.projeto}`;
  
  const pResp = document.createElement("p");
  pResp.innerHTML = `<strong>Investigador:</strong> ${alvo.responsavel || 'Desconhecido'}`;
  
  const pPrazo = document.createElement("p");
  pPrazo.innerHTML = `<strong>Último Avisto:</strong> ${alvo.prazo}`;

  anotacoes.append(pProjeto, pResp, pPrazo);
  cartao.append(tachinha, carimbo, foto, anotacoes);
  item.append(cartao);
  
  return item;
}

export function renderizarTarefas(alvos, quadro = document.querySelector("[data-quadro]")) {
  if (!quadro) return;
  const listas = quadro.querySelectorAll("[data-lista-status]");
  listas.forEach((lista) => {
    const status = lista.dataset.listaStatus;
    const alvosDoStatus = alvos.filter((a) => a.status === status);
    const cartoes = alvosDoStatus.map(criarCartao);
    lista.replaceChildren(...cartoes);
  });
}