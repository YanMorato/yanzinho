// jo-ken-po.js
(function () {
  const gameArea = document.getElementById("game-area");
  if (!gameArea) return;

  // Limpar antes de injetar o jogo
  gameArea.innerHTML = "";

  // Injetar HTML do jogo
  gameArea.innerHTML = `
    <div class="game jokenpo">
      <h1>✊ Jokenpô Arcade</h1>
      <div class="botoes">
        <button data-choice="pedra" title="Pedra">
          <svg viewBox="0 0 100 100"><path d="M50 12 C68 12 86 28 86 46 C86 64 70 86 50 86 C30 86 14 68 14 46 C14 28 32 12 50 12 Z" fill="#9aa1a6" stroke="#6b6d70" stroke-width="2"/></svg>
        </button>
        <button data-choice="papel" title="Papel">
          <svg viewBox="0 0 100 100"><rect x="18" y="12" width="64" height="76" rx="6" fill="#ffffff" stroke="#dcdcdc" stroke-width="2"/><path d="M62 12 L62 28 L82 28" fill="none" stroke="#cfcfcf" stroke-width="2"/></svg>
        </button>
        <button data-choice="tesoura" title="Tesoura">
          <svg viewBox="0 0 100 100"><circle cx="30" cy="34" r="12" fill="#f4f4f4" stroke="#cfcfcf" stroke-width="2"/><circle cx="30" cy="66" r="12" fill="#f4f4f4" stroke="#cfcfcf" stroke-width="2"/><path d="M40 40 L92 6" stroke="#cfcfcf" stroke-width="6" stroke-linecap="round"/><path d="M40 60 L92 94" stroke="#cfcfcf" stroke-width="6" stroke-linecap="round"/></svg>
        </button>
      </div>

      <div class="arena">
        <div class="lado">
          <h3>Você</h3>
          <div id="jogadorIcon" class="icon"></div>
        </div>
        <div class="lado">
          <h3>Computador</h3>
          <div id="computadorIcon" class="icon"></div>
        </div>
      </div>

      <div id="mensagem">Faça sua jogada!</div>

      <div class="placar">
        <p>Vitórias: <span id="vitorias">0</span></p>
        <p>Derrotas: <span id="derrotas">0</span></p>
        <p>Empates: <span id="empates">0</span></p>
      </div>

      <button class="btn-reset">Resetar Placar</button>
    </div>

    <audio id="sound-click" src="https://freesound.org/data/previews/341/341695_5121236-lq.mp3"></audio>
  `;

  // -------- Lógica do jogo --------
  let vitorias = 0, derrotas = 0, empates = 0;

  const jogadorIcon = document.getElementById("jogadorIcon");
  const computadorIcon = document.getElementById("computadorIcon");
  const mensagemEl = document.getElementById("mensagem");

  const vitoriasEl = document.getElementById("vitorias");
  const derrotasEl = document.getElementById("derrotas");
  const empatesEl = document.getElementById("empates");

  const soundClick = document.getElementById("sound-click");

  function clearHighlights() {
    [jogadorIcon, computadorIcon].forEach(el => el.className = "icon");
    mensagemEl.className = "";
    mensagemEl.textContent = "Preparando...";
  }

  document.querySelectorAll(".botoes button").forEach(button => {
    button.addEventListener("click", () => {
      soundClick.play();
      clearHighlights();

      const escolhaJogador = button.dataset.choice;
      const opcoes = ["pedra", "papel", "tesoura"];
      const escolhaComputador = opcoes[Math.floor(Math.random() * 3)];

      jogadorIcon.innerHTML = button.innerHTML;
      const compButton = document.querySelector(`.botoes button[data-choice="${escolhaComputador}"]`);
      computadorIcon.innerHTML = compButton.innerHTML;

      jogadorIcon.classList.add("shake");
      computadorIcon.classList.add("shake");

      setTimeout(() => {
        jogadorIcon.classList.remove("shake");
        computadorIcon.classList.remove("shake");

        let resultado;
        if (escolhaJogador === escolhaComputador) {
          resultado = "Empate!";
          empates++;
          empatesEl.textContent = empates;
          jogadorIcon.classList.add("draw");
          computadorIcon.classList.add("draw");
          mensagemEl.classList.add("msg-draw");
        } else if (
          (escolhaJogador === "pedra" && escolhaComputador === "tesoura") ||
          (escolhaJogador === "papel" && escolhaComputador === "pedra") ||
          (escolhaJogador === "tesoura" && escolhaComputador === "papel")
        ) {
          resultado = "Você venceu! 🎉";
          vitorias++;
          vitoriasEl.textContent = vitorias;
          jogadorIcon.classList.add("win");
          computadorIcon.classList.add("lose");
          mensagemEl.classList.add("msg-win");
        } else {
          resultado = "Você perdeu! 😢";
          derrotas++;
          derrotasEl.textContent = derrotas;
          jogadorIcon.classList.add("lose");
          computadorIcon.classList.add("win");
          mensagemEl.classList.add("msg-lose");
        }

        mensagemEl.textContent = resultado;
      }, 650);
    });
  });

  document.querySelector(".btn-reset").addEventListener("click", () => {
    vitorias = derrotas = empates = 0;
    vitoriasEl.textContent = derrotasEl.textContent = empatesEl.textContent = 0;
    mensagemEl.textContent = "Placar resetado!";
    mensagemEl.className = "";
    jogadorIcon.innerHTML = "";
    computadorIcon.innerHTML = "";
  });
})();
