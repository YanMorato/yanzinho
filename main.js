function executarJogo(nome) {

  // Se houver jogo ativo com cleanup, chama ele para garantir limpeza
try {
if (window.__currentGame && typeof window.__currentGame.cleanup === 'function') {
window.__currentGame.cleanup();
}
} catch (e) {
console.warn('Erro ao chamar cleanup do jogo anterior', e);
}
  // Remove o script anterior
  const scriptsAnteriores = document.querySelectorAll('script[data-jogo]');
  scriptsAnteriores.forEach(s => s.remove());

  // Importar dinamicamente
  const script = document.createElement('script');
  script.src = `${nome}.js`;
  script.dataset.jogo = nome;
  script.onload = () => {
    console.log(`Jogo "${nome}" carregado.`);
    abrirModal();
  };
  script.onerror = () => {
    console.error(`Erro ao carregar o jogo "${nome}"`);
  };
  document.body.appendChild(script);

  document.getElementById("jogoAtual").textContent = `Executando: ${nome}`;
  console.clear();
}

// ---- Modal ----
const modal = document.getElementById("game-modal");
const closeModalBtn = document.getElementById("close-modal");

function abrirModal() {
  modal.style.display = "block";
}

closeModalBtn.onclick = function() {
  modal.style.display = "none";
  document.getElementById("game-area").innerHTML = ""; // limpa o jogo ao fechar
};

window.onclick = function(event) {
  if (event.target === modal) {
    modal.style.display = "none";
    document.getElementById("game-area").innerHTML = "";
  }
};
