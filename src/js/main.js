/* ---- screens (menu / level cleared / game over), main loop, canvas fitting ---- */
const ov=$('ov');
$('menuRec').textContent=best?`Твой рекорд: ${best}`:'';
function card(title,text,btn,rec){ov.innerHTML=`<div class="card"><h1>${title}</h1><p>${text}</p>${rec?`<p class="rec">${rec}</p>`:''}<button class="btn" id="go">${btn}</button></div>`;ov.hidden=false;$('go').onclick=start;}
$('go').onclick=start;
function start(){
  initAudio();
  if(state==='cleared'){lvl++;reset(false);}
  else if(state!=='play')reset(true);
  state='play';ov.hidden=true;document.activeElement&&document.activeElement.blur&&document.activeElement.blur();
}
function levelWon(){
  const w=LEVELS[lvl].win;
  if(lvl<LEVELS.length-1){
    state='cleared';
    card(w.title,`${w.text} Янтарь: ${gems}, очки: ${score}.`,w.btn);
  }else{
    state='done';const rec=score>best;saveBest();
    card(w.title,`${w.text} Янтарь: ${gems}, очки: ${score}.`,'Ещё раз',rec?'Новый рекорд!':`Рекорд: ${best}`);
  }
}
function gameOver(){
  state='over';const rec=score>best;saveBest();
  card('Конец игры',`Очки: ${score}. Попробуй ещё раз, маяк ждёт.`,'Заново',rec?'Новый рекорд!':`Рекорд: ${best}`);
}

/* ---- loop with fixed step ---- */
let last=performance.now(),accum=0,shownLvl=-1;
function frame(now){
  accum+=Math.min(100,now-last);last=now;
  if(state==='play'&&shownLvl!==lvl+'/'+lives){shownLvl=lvl+'/'+lives;lvlBanner=time+120}
  while(accum>=1000/60){if(state==='play'||state==='win')update();else time++;accum-=1000/60}
  const hasFire=!!(player&&player.fire&&state==='play');
  if(document.body.classList.contains('has-fire')!==hasFire)document.body.classList.toggle('has-fire',hasFire);
  music.set(state==='play'?LEVELS[lvl].theme:null);
  draw();requestAnimationFrame(frame);
}

/* tap on the ♪ in the HUD toggles music */
cv.addEventListener('pointerdown',e=>{
  const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*VW,y=(e.clientY-r.top)/r.height*VH;
  if(x>=musicBtn.x-4&&x<=musicBtn.x+musicBtn.w+4&&y<=musicBtn.h+4){initAudio();toggleMusic()}
});

/* ---- scale canvas to fill the available space ---- */
const stage=document.querySelector('.stage');
function fit(){
  const r=stage.getBoundingClientRect();
  const s=Math.max(.5,Math.min(r.width/VW,r.height/VH));
  const cw=Math.floor(VW*s),ch=Math.floor(VH*s),dpr=window.devicePixelRatio||1;
  cv.style.width=cw+'px';cv.style.height=ch+'px';
  cv.width=Math.round(cw*dpr);cv.height=Math.round(ch*dpr);
  SC=cv.width/VW;
}
if(window.ResizeObserver)new ResizeObserver(fit).observe(stage);
addEventListener('resize',fit);fit();
reset(true);
requestAnimationFrame(frame);
