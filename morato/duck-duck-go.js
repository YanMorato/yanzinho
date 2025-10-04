/*
duck-duck-go.js

* Carrega o mini-game "Duck Duck Go" dentro de #game-area
* Arquivo pronto para ser importado dinamicamente pelo seu main.js
* Não depende de recursos externos (SVGs e som gerados via WebAudio)
  */

(function () {
const gameArea = document.getElementById("game-area");
if (!gameArea) return;

// limpa área antes
gameArea.innerHTML =`
<div class="ddg" role="application" aria-label="Duck Duck Go mini game">
  <div class="header">
    <h2>Duck Duck Go 🦆</h2>
    <div class="controls">
      <button id="ddg-start">Iniciar</button>
      <button id="ddg-stop">Parar</button>
      <div class="stats">
        <span>Tempo: <strong id="ddg-timer">30</strong>s</span>
        <span>Pontos: <strong id="ddg-score">0</strong></span>
        <span>Erros: <strong id="ddg-misses">0</strong></span>
      </div>
    </div>
  </div>

  <div class="arena">
    <div class="grid" id="ddg-grid" aria-live="polite">

    </div>
  </div>

  <div class="footer">
    <div class="result" id="ddg-result">Pronto para jogar — clique em Iniciar</div>
    <div>
      <button id="ddg-reset" style="background:rgba(255,255,255,0.06); padding:8px 10px; border-radius:8px; border:none; cursor:pointer;">Resetar</button>
    </div>
  </div>
</div>`;

// Lógica do jogo
const GRID = document.getElementById("ddg-grid");
const START_BTN = document.getElementById("ddg-start");
const STOP_BTN = document.getElementById("ddg-stop");
const RESET_BTN = document.getElementById("ddg-reset");
const TIMER_EL = document.getElementById("ddg-timer");
const SCORE_EL = document.getElementById("ddg-score");
const MISSES_EL = document.getElementById("ddg-misses");
const RESULT_EL = document.getElementById("ddg-result");

// configuração
const TOTAL_HOLES = 15;        // quantidade de "buracos" exibidos (grid 5x3 por padrão)
let gameInterval = null;
let spawnInterval = null;
let timerInterval = null;
let timeLeft = 30;
let score = 0;
let misses = 0;
let running = false;

// cria os "buracos" no grid
function criarHoles(n = TOTAL_HOLES) {
GRID.innerHTML = "";
for (let i = 0; i < n; i++) {
const hole = document.createElement("div");
hole.className = "hole";
hole.dataset.index = i;

  // flash overlay
  const flash = document.createElement("div");
  flash.className = "flash";

  // duck (SVG inline)
  const duck = document.createElement("div");
  duck.className = "duck";
  duck.tabIndex = 0;
  duck.innerHTML = duckSVG(); // insere SVG
  duck.setAttribute("role", "button");
  duck.setAttribute("aria-label", "pato");

  // append
  hole.appendChild(duck);
  hole.appendChild(flash);
  GRID.appendChild(hole);

  // clique no pato
  duck.addEventListener("click", (e) => {
    if (!duck.classList.contains("up") || !running) return;
    hitDuck(duck, hole, flash);
  });

  // também teclado (acessibilidade)
  duck.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && duck.classList.contains("up") && running) {
      hitDuck(duck, hole, flash);
      e.preventDefault();
    }
  });
}
}

// retorna SVG do pato (inline)
function duckSVG() {
return `       <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">         <g transform="translate(0,2)">           <ellipse cx="52" cy="56" rx="26" ry="18" fill="#ffd166"></ellipse>           <path d="M30 52 C26 46 30 38 40 36 C44 34 50 36 56 36 C66 36 72 44 68 52" fill="#ffd166"/>           <circle cx="69" cy="44" r="6" fill="#ffd166"></circle>           <path d="M72 42 L86 38 L82 46 Z" fill="#ff8d00"/> <!-- bico -->           <circle cx="62" cy="42" r="4" fill="#111"/> <!-- olho -->         </g>       </svg>
    `;
}

// som simples com WebAudio (clique / hit)
const audioCtx = (typeof window.AudioContext !== "undefined") ? new AudioContext() : null;
function playBeep(freq = 600, time = 0.08, type = "sine") {
if (!audioCtx) return;
const o = audioCtx.createOscillator();
const g = audioCtx.createGain();
o.type = type;
o.frequency.value = freq;
o.connect(g);
g.connect(audioCtx.destination);
g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
g.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.01);
o.start();
g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + time);
o.stop(audioCtx.currentTime + time + 0.02);
}

// quando o jogador acerta o pato
function hitDuck(duck, hole, flash) {
// feedback visual
duck.classList.remove("up");
flash.classList.add("show");
setTimeout(() => flash.classList.remove("show"), 180);

score += 1;
SCORE_EL.textContent = score;
playBeep(900, 0.09, "square");

// impede rehit instantâneo
duck.dataset.active = "0";

}

// spawn aleatório de pato: sobe por um tempo e depois desce se não for clicado (gera miss)
function spawnDuck() {
const holes = Array.from(document.querySelectorAll(".hole"));
if (!holes.length) return;

// escolhe hole aleatório que não esteja com duck up
const candidates = holes.filter(h => {
  const duck = h.querySelector(".duck");
  return !duck.classList.contains("up");
});
if (!candidates.length) return;

const hole = candidates[Math.floor(Math.random() * candidates.length)];
const duck = hole.querySelector(".duck");
const flash = hole.querySelector(".flash");

// sobe
duck.classList.add("up");
duck.dataset.active = "1";

// tempo que ficará visível (varia com o tempo restante para aumentar dificuldade)
const base = 900; // ms
const variable = Math.max(200, 1200 - (30 - timeLeft) * 25); // diminui até certo ponto
const visibleFor = base + Math.floor(Math.random() * variable);

// se não acertado, conta como miss ao desaparecer
setTimeout(() => {
  if (duck.classList.contains("up")) {
    // desce
    duck.classList.remove("up");
    if (duck.dataset.active === "1" && running) {
      misses += 1;
      MISSES_EL.textContent = misses;
      playBeep(220, 0.12, "sawtooth");
    }
  }
}, visibleFor);

}

// inicia o loop do jogo
function startGame(duration = 30) {
if (running) return;
running = true;
score = 0; misses = 0;
timeLeft = duration;
TIMER_EL.textContent = timeLeft;
SCORE_EL.textContent = score;
MISSES_EL.textContent = misses;
RESULT_EL.textContent = "Boa sorte! 🦆";

// cria holes se necessário
const columns = window.innerWidth <= 560 ? 3 : 5;
const rows = 3;
const holesCount = columns * rows;
criarHoles(holesCount);

// spawn a cada X ms (ajusta com dificuldade)
spawnInterval = setInterval(spawnDuck, 700);

// timer
timerInterval = setInterval(() => {
  timeLeft -= 1;
  TIMER_EL.textContent = timeLeft;
  if (timeLeft <= 0) {
    endGame();
  }
}, 1000);

}

function endGame() {
running = false;
clearInterval(spawnInterval);
clearInterval(timerInterval);
spawnInterval = null;
timerInterval = null;

// limpa patos visíveis
document.querySelectorAll(".duck.up").forEach(d => d.classList.remove("up"));

// resultado
let msg = `Fim! Sua pontuação: ${score}. Erros: ${misses}.`;
if (score >= 25) msg += " Mestre dos Patos! 🏆";
else if (score >= 15) msg += " Bom trabalho! 🎯";
else msg += " Tente melhorar! 😉";

RESULT_EL.textContent = msg;
playBeep(520, 0.18, "triangle");
}

// botão stop para interromper imediatamente
function stopGame() {
if (!running) return;
running = false;
clearInterval(spawnInterval);
clearInterval(timerInterval);
spawnInterval = null;
timerInterval = null;
RESULT_EL.textContent = "Jogo pausado";
}

// reset completa
function resetGame() {
stopGame();
score = 0; misses = 0; timeLeft = 30;
TIMER_EL.textContent = timeLeft;
SCORE_EL.textContent = score;
MISSES_EL.textContent = misses;
RESULT_EL.textContent = "Pronto — clique em Iniciar";
GRID.innerHTML = "";
}

// liga botões
START_BTN.addEventListener("click", () => {
// para permitir som em alguns navegadores que bloqueiam autoplay, resume o contexto se necessário
if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
startGame(30);
});
STOP_BTN.addEventListener("click", stopGame);
RESET_BTN.addEventListener("click", resetGame);

// inicia um layout base mesmo antes de start
criarHoles(15);
})();