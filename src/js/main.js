/* ---- screens (menu / level cleared / game over), main loop, canvas fitting ---- */
const ov=$('ov');
$('menuRec').textContent=best?`Твой рекорд: ${best}`:'';
// extra: secondary buttons [{label, fn}] shown under the main one
function card(title,text,btn,rec,extra=[]){
  ov.innerHTML=`<div class="card"><h1>${title}</h1><p>${text}</p>${rec?`<p class="rec">${rec}</p>`:''}<button class="btn" id="go">${btn}</button>`+
    extra.map((b,i)=>`<button class="btn alt" id="x${i}">${b.label}</button>`).join('')+`</div>`;
  ov.hidden=false;$('go').onclick=start;extra.forEach((b,i)=>$('x'+i).onclick=b.fn);
}
$('go').onclick=start;
function start(){
  initAudio();
  if(state==='pause'){state='play';ov.hidden=true;document.activeElement&&document.activeElement.blur&&document.activeElement.blur();return}
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
function pause(){
  if(state!=='play')return;
  state='pause';
  card('Пауза','Рыжик присел отдохнуть. Можно продолжить или начать уровень заново.','Продолжить',null,
    [{label:'Уровень заново',fn:()=>{gems=gems0;score=score0;reset(false);state='play';ov.hidden=true}}]);
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
  music.set(state==='play'?(bossActive()&&boss.mode!=='leave'?'boss':LEVELS[lvl].theme):null);
  draw();requestAnimationFrame(frame);
}

/* taps on the HUD icons: ⏸ pauses, ♪ toggles music */
const inBtn=(b,x,y)=>x>=b.x-4&&x<=b.x+b.w+4&&y<=b.h+4;
cv.addEventListener('pointerdown',e=>{
  const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*VW,y=(e.clientY-r.top)/r.height*VH;
  if(inBtn(musicBtn,x,y)){initAudio();toggleMusic()}
  else if(inBtn(pauseBtn,x,y))pause();
});
// leaving the app (home button, another tab) pauses the game
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});

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
