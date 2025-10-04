/*
flappyUltimate.js

* Cria o canvas dentro de #game-area se necessário
* Se registra em window.__currentGame com .cleanup()
* Observa remoção do canvas e limpa tudo (listeners, RAF, áudios)
* Não depende de alterações em main.js
  */
  (function(){
  const GAME_ID = 'flappyUltimate';

  // Se houver outro jogo ativo, peça para limpar (se suportado)
  try { if(window.__currentGame && typeof window.__currentGame.cleanup === 'function') window.__currentGame.cleanup(); } catch(e){}

  const container = document.getElementById('game-area');
  if(!container) { console.error('[Flappy] Container #game-area não encontrado.'); return; }

  // --- Helpers para criar assets se não existirem ---
  function ensureAsset(id, tag, attrs = {}) {
  let el = document.getElementById(id);
  if(!el) {
  el = document.createElement(tag);
  el.id = id;
  Object.keys(attrs).forEach(k => el.setAttribute(k, attrs[k]));
  el.style.display = 'none';
  document.body.appendChild(el);
  }
  return el;
  }

  const birdSprite = ensureAsset('birdSprite','img',{src:'https://i.ibb.co/Tk6m6fB/bird-sprite.png'});
const pipeSprite = ensureAsset('pipeSprite','img',{src:'https://i.ibb.co/fk7R4rP/pipe.png'});
const groundSprite = ensureAsset('groundSprite','img',{src:'https://i.ibb.co/q0sH8Lf/ground.png'});

const jumpSound = ensureAsset('jumpSound','audio',{src:'https://freesound.org/data/previews/331/331912_3248244-lq.mp3', preload:'auto'});
const pointSound = ensureAsset('pointSound','audio',{src:'https://freesound.org/data/previews/331/331912_3248244-lq.mp3', preload:'auto'});
const hitSound = ensureAsset('hitSound','audio',{src:'https://freesound.org/data/previews/331/331912_3248244-lq.mp3', preload:'auto'});

  // --- Cria canvas se necessário ---
  let canvas = document.getElementById('flappyCanvas');
  if(!canvas) {
  canvas = document.createElement('canvas');
  canvas.id = 'flappyCanvas';
  canvas.width = 400;
  canvas.height = 600;
  // opcional: limpar a área do jogo para garantir
  container.innerHTML = '';
  container.appendChild(canvas);
  } else {
  // se já existir, garante que esteja no container
  if(!container.contains(canvas)) container.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');

  // Constantes
  const GRAVITY = 0.3;
  const FLAP_STRENGTH = -8;
  const PIPE_WIDTH = 80;
  const PIPE_GAP = 150;
  const GROUND_HEIGHT = 112;

  // Estado
  let bird = {x:50, y:canvas.height/2, width:34, height:24, velocity:0, frame:0, rotation:0};
  let pipes = [];
  let particles = [];
  let score = 0;
  let gameOver = false;
  let frameCount = 0;
  let groundX = 0;
  let gameStarted = false;
  let rafId = null;
  let running = true;

  // Eventos com nomes (para remover depois)
  function onKeyDown(e){ if(e.code === 'Space') flap(); }
  function onClick(e){ flap(); }
  function onTouch(e){ e.preventDefault(); flap(); }

  // Adiciona listeners
  document.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('click', onClick);
  canvas.addEventListener('touchstart', onTouch, {passive:false});

  // MutationObserver para detectar remoção do canvas
  const observer = new MutationObserver(muts => {
  for(const m of muts){
  for(const n of m.removedNodes){
  if(n === canvas || (n.contains && n.contains(canvas))){ cleanup(); return; }
  }
  // Se #game-area ficou vazio (algum outro script limpou), cleanup também
  if(!container.contains(canvas)) { cleanup(); return; }
  }
  });
  observer.observe(container, {childList:true, subtree:true});

  // Funções do jogo
  function flap(){
  if(!gameStarted){ gameStarted = true; return; }
  if(!gameOver){
  bird.velocity = FLAP_STRENGTH;
  try{ jumpSound.currentTime = 0; jumpSound.play(); }catch(e){}
  } else {
  resetGame();
  }
  }

  function resetGame(){
  bird.y = canvas.height/2;
  bird.velocity = 0;
  bird.frame = 0;
  bird.rotation = 0;
  pipes = [];
  particles = [];
  score = 0;
  frameCount = 0;
  groundX = 0;
  gameOver = false;
  gameStarted = false;
  }

  function createPipe(){
  const topHeight = Math.floor(Math.random()*(canvas.height - PIPE_GAP - GROUND_HEIGHT - 50)) + 50;
  pipes.push({x:canvas.width, y:topHeight});
  }

  function createParticles(x,y){
  for(let i=0;i<12;i++){
  particles.push({x:x, y:y, vx:(Math.random()-0.5)*4, vy:Math.random()*-2-1, alpha:1});
  }
  }

  function updateParticles(){
  particles.forEach(p=>{ p.x += p.vx; p.y += p.vy; p.alpha -= 0.05; });
  particles = particles.filter(p=>p.alpha>0);
  }

  function update(){
  if(!gameStarted || gameOver) return;

  bird.velocity += GRAVITY;
  bird.y += bird.velocity;
  bird.rotation = Math.min(Math.max(bird.velocity/10, -0.5), 0.5);

  if(frameCount % 90 === 0) createPipe();

  pipes.forEach(pipe => pipe.x -= 2);
  pipes = pipes.filter(pipe => pipe.x + PIPE_WIDTH > 0);

  pipes.forEach(pipe=>{
  if(bird.x + bird.width > pipe.x && bird.x < pipe.x + PIPE_WIDTH &&
  (bird.y < pipe.y || bird.y + bird.height > pipe.y + PIPE_GAP)){
  try{ hitSound.currentTime = 0; hitSound.play(); }catch(e){}
  createParticles(bird.x+bird.width/2, bird.y+bird.height/2);
  gameOver = true;
  }
  // usa >= para evitar perder o +1 quando a velocidade pula frames
  if(pipe.x + PIPE_WIDTH <= bird.x && !pipe._scored){
  pipe._scored = true;
  score++;
  try{ pointSound.currentTime = 0; pointSound.play(); }catch(e){}
  }
  });

  if(bird.y + bird.height > canvas.height - GROUND_HEIGHT || bird.y < 0){
  try{ hitSound.currentTime = 0; hitSound.play(); }catch(e){}
  createParticles(bird.x+bird.width/2, bird.y+bird.height/2);
  gameOver = true;
  }

  groundX = (groundX - 2) % canvas.width;
  frameCount++;
  updateParticles();
  }

  
  function draw(){
  // fundo
  ctx.fillStyle = '#70c5ce';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // pipes (fallback retângulos caso a imagem não tenha carregado)
  pipes.forEach(pipe=>{
  if(pipeSprite.complete && pipeSprite.naturalWidth){
  ctx.drawImage(pipeSprite, 0, 0, PIPE_WIDTH, pipe.y, pipe.x, 0, PIPE_WIDTH, pipe.y);
  const bottomH = canvas.height - pipe.y - PIPE_GAP - GROUND_HEIGHT;
  ctx.drawImage(pipeSprite, 0, 0, PIPE_WIDTH, bottomH, pipe.x, pipe.y+PIPE_GAP, PIPE_WIDTH, bottomH);
  } else {
  ctx.fillStyle = 'green';
  ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.y);
  ctx.fillRect(pipe.x, pipe.y+PIPE_GAP, PIPE_WIDTH, canvas.height - pipe.y - PIPE_GAP - GROUND_HEIGHT);
  }
  });

  // partículas
  particles.forEach(p=>{
  ctx.fillStyle = `rgba(255,220,0,${p.alpha})`;
  ctx.fillRect(p.x,p.y,3,3);
  });

  // chão
  if(groundSprite.complete && groundSprite.naturalWidth){
  ctx.drawImage(groundSprite, groundX, canvas.height-GROUND_HEIGHT);
  ctx.drawImage(groundSprite, groundX + canvas.width, canvas.height-GROUND_HEIGHT);
  } else {
  ctx.fillStyle = '#DEB887';
  ctx.fillRect(0, canvas.height-GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);
  }

  // pássaro
  ctx.save();
  ctx.translate(bird.x + bird.width/2, bird.y + bird.height/2);
  ctx.rotate(bird.rotation);
  if(birdSprite.complete && birdSprite.naturalWidth){
  // sprite: assume 3 frames verticais, frameHeight = bird.height
  const birdFrameY = bird.frame * bird.height;
  ctx.drawImage(birdSprite, 0, birdFrameY, bird.width, bird.height, -bird.width/2, -bird.height/2, bird.width, bird.height);
  } else {
  ctx.fillStyle = 'yellow';
  ctx.fillRect(-bird.width/2, -bird.height/2, bird.width, bird.height);
  }
  ctx.restore();

  // pontuação
  ctx.fillStyle = 'white';
  ctx.font = '40px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(score, canvas.width/2, 50);

  // instruções inicial
  if(!gameStarted){
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Clique ou toque para iniciar', canvas.width/2, canvas.height/2);
  }

  // game over
  if(gameOver){
  ctx.fillStyle = 'red';
  ctx.font = '36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 10);
  ctx.font = '18px Arial';
  ctx.fillText('Clique ou toque para reiniciar', canvas.width/2, canvas.height/2 + 24);
  }
  }

  function loop(){
  if(!running) return;
  update();
  draw();
  rafId = requestAnimationFrame(loop);
  }

  // cleanup robusto
  function cleanup(){
  running = false;
  if(rafId) cancelAnimationFrame(rafId);
  try{ document.removeEventListener('keydown', onKeyDown); }catch(e){}
  try{ canvas.removeEventListener('click', onClick); canvas.removeEventListener('touchstart', onTouch); }catch(e){}
  try{ observer.disconnect(); }catch(e){}
  // parar/zerar áudios
  [jumpSound, pointSound, hitSound].forEach(a=>{ try{ a.pause(); a.currentTime = 0; }catch(e){} });
  // remove referência global
  if(window.__currentGame && window.__currentGame.id === GAME_ID) window.__currentGame = null;
  // opcional: remover canvas do DOM (comente se preferir que main.js faça isso)
  // if(container.contains(canvas)) container.removeChild(canvas);
  console.log('[Flappy] cleanup executado.');
  }

  // --- Função de preload ---
function loadImage(el) {
  return new Promise((resolve, reject) => {
    if (el.complete && el.naturalWidth) resolve();
    el.onload = resolve;
    el.onerror = reject;
  });
}

  // registra globalmente (para main.js chamar se quiser)
  window.__currentGame = { id: GAME_ID, cleanup };

  // inicia loop **apenas depois que sprites carregarem**
Promise.all([
  loadImage(birdSprite),
  loadImage(pipeSprite),
  loadImage(groundSprite)
]).then(() => {
  console.log("[Flappy] Sprites carregados, iniciando jogo...");
  loop();
}).catch(err => {
  console.error("[Flappy] Erro ao carregar sprites:", err);
  // fallback: inicia mesmo sem sprites
  loop();
});

})();
