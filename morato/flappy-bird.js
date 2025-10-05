/*
flappyUltimate.js

* Cria o canvas dentro de #game-area se necessário
* Se registra em window.__currentGame com .cleanup()
* Observa remoção do canvas e limpa tudo (listeners, RAF, áudios)
* Não depende de alterações em main.js
*/
(function(){
  const GAME_ID = 'flappyUltimate';

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

  // Sprites
  const birdFrames = [
    ensureAsset('birdUp','img',{
      src:'https://raw.githubusercontent.com/sourabhv/FlappyBirdClone/master/assets/sprites/yellowbird-upflap.png'
    }),
    ensureAsset('birdMid','img',{
      src:'https://raw.githubusercontent.com/sourabhv/FlappyBirdClone/master/assets/sprites/yellowbird-midflap.png'
    }),
    ensureAsset('birdDown','img',{
      src:'https://raw.githubusercontent.com/sourabhv/FlappyBirdClone/master/assets/sprites/yellowbird-downflap.png'
    })
  ];
  const pipeSprite = ensureAsset('pipeSprite','img',{
    src:'https://raw.githubusercontent.com/sourabhv/FlappyBirdClone/master/assets/sprites/pipe-green.png'
  });
  const groundSprite = ensureAsset('groundSprite','img',{
    src:'cardsimg/base-flappy.png'
  });

  // Sons
  const jumpSound = ensureAsset('jumpSound','audio',{src:'https://freesound.org/data/previews/331/331912_3248244-lq.mp3', preload:'auto'});
  const pointSound = ensureAsset('pointSound','audio',{src:'https://freesound.org/data/previews/331/331912_3248244-lq.mp3', preload:'auto'});
  const hitSound = ensureAsset('hitSound','audio',{src:'https://freesound.org/data/previews/331/331912_3248244-lq.mp3', preload:'auto'});

  // Canvas
  let canvas = document.getElementById('flappyCanvas');
  if(!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'flappyCanvas';
    canvas.width = 330;
    canvas.height = 600;
    container.innerHTML = '';
    container.appendChild(canvas);
  } else {
    if(!container.contains(canvas)) container.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');

  // Constantes
  const GRAVITY = 0.3;
  const FLAP_STRENGTH = -7;
  const PIPE_WIDTH = 80;
  const PIPE_GAP = 150;
  const GROUND_HEIGHT = 112;

  // Estado
  let bird = {x:50, y:canvas.height/2, width:34, height:24, velocity:0, rotation:0};
  let pipes = [];
  let particles = [];
  let score = 0;
  let gameOver = false;
  let frameCount = 0;
  let groundX = 0;
  let gameStarted = false;
  let rafId = null;
  let running = true;

  // Eventos
  function onKeyDown(e){ if(e.code === 'Space') flap(); }
  function onClick(e){ flap(); }
  function onTouch(e){ e.preventDefault(); flap(); }

  document.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('click', onClick);
  canvas.addEventListener('touchstart', onTouch, {passive:false});

  // MutationObserver para detectar remoção
  const observer = new MutationObserver(muts => {
    for(const m of muts){
      for(const n of m.removedNodes){
        if(n === canvas || (n.contains && n.contains(canvas))){ cleanup(); return; }
      }
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
      if(bird.x + bird.width -5 > pipe.x && bird.x +5< pipe.x + PIPE_WIDTH &&
        (bird.y +5 < pipe.y || bird.y + bird.height -5 > pipe.y + PIPE_GAP)){
        try{ hitSound.currentTime = 0; hitSound.play(); }catch(e){}
        createParticles(bird.x+bird.width/2, bird.y+bird.height/2);
        gameOver = true;
      }
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
    ctx.fillStyle = '#3bb3ebff';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // pipes
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

    // pássaro com animação de asas
    ctx.save();
    ctx.translate(bird.x + bird.width/2, bird.y + bird.height/2);
    ctx.rotate(bird.rotation);

    const frameIndex = Math.floor(frameCount / 5) % birdFrames.length;
    const sprite = birdFrames[frameIndex];

    if(sprite.complete && sprite.naturalWidth){
      ctx.drawImage(sprite, -bird.width/2, -bird.height/2, bird.width, bird.height);
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

    if(!gameStarted){
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.fillText('Clique ou toque para iniciar', canvas.width/2, canvas.height/2);
    }

    if(gameOver){
      ctx.fillStyle = 'red';
      ctx.font = '36px Arial';
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

  function cleanup(){
    running = false;
    if(rafId) cancelAnimationFrame(rafId);
    try{ document.removeEventListener('keydown', onKeyDown); }catch(e){}
    try{ canvas.removeEventListener('click', onClick); canvas.removeEventListener('touchstart', onTouch); }catch(e){}
    try{ observer.disconnect(); }catch(e){}
    [jumpSound, pointSound, hitSound].forEach(a=>{ try{ a.pause(); a.currentTime = 0; }catch(e){} });
    if(window.__currentGame && window.__currentGame.id === GAME_ID) window.__currentGame = null;
    console.log('[Flappy] cleanup executado.');
  }

  function loadImage(el) {
    return new Promise((resolve, reject) => {
      if (el.complete && el.naturalWidth) resolve();
      el.onload = resolve;
      el.onerror = reject;
    });
  }

  window.__currentGame = { id: GAME_ID, cleanup };

  Promise.all([
    ...birdFrames.map(loadImage),
    loadImage(pipeSprite),
    loadImage(groundSprite)
  ]).then(() => {
    console.log("[Flappy] Sprites carregados, iniciando jogo...");
    loop();
  }).catch(err => {
    console.error("[Flappy] Erro ao carregar sprites:", err);
    loop();
  });

})();