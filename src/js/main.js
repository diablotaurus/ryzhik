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
const unfocus=()=>document.activeElement&&document.activeElement.blur&&document.activeElement.blur();
const starStr=n=>'★'.repeat(n)+(n<3?`<span class="off">${'☆'.repeat(3-n)}</span>`:'');
function start(){
  initAudio();
  if(state==='pause'){state='play';ov.hidden=true;unfocus();return}
  if(state==='cleared'){lvl++;reset(false)}
  else if(state==='map'){lvl=Math.min(save.open,LEVELS.length-1);reset(true)}  // Enter on the map: furthest open level
  else if(state==='over')reset(true);                                           // same level, fresh lives
  else if(state!=='play'){showMap();return}
  state='play';ov.hidden=true;unfocus();
}
function playLevel(i){initAudio();lvl=i;reset(true);state='play';ov.hidden=true;unfocus()}
/* world map: the way home as a trail of levels; locked ones open as you clear the previous */
function showMap(){
  state='map';
  const total=save.stars.reduce((a,b)=>a+(b||0),0);
  const nodes=LEVELS.map((L,i)=>{
    const open=i<=save.open;
    return `<button class="node ${L.theme}" data-i="${i}"${open?'':' disabled'}><b>${i+1}</b><span>${L.name}</span>`+
      `<i>${open?starStr(save.stars[i]||0):'закрыто'}</i></button>`;
  }).join('');
  ov.innerHTML=`<div class="card map"><h1>Путь домой</h1><div class="trail">${nodes}</div>`+
    `<p class="rec">Звёзды: ${total} из ${LEVELS.length*3}${best?` · рекорд ${best}`:''}</p>`+
    `<p class="hint">★ пройти уровень · ★ собрать весь янтарь · ★ не потерять ни одной жизни</p></div>`;
  ov.hidden=false;
  ov.querySelectorAll('.node:not([disabled])').forEach(b=>b.onclick=()=>playLevel(+b.dataset.i));
  const next=ov.querySelector(`.node[data-i="${Math.min(save.open,LEVELS.length-1)}"]`);next&&next.focus();
}
const toMap={label:'Карта',fn:showMap};
function levelWon(){
  const w=LEVELS[lvl].win,got=levelStars(),n=got.filter(Boolean).length;
  save.stars[lvl]=Math.max(save.stars[lvl]||0,n);save.open=Math.max(save.open,Math.min(lvl+1,LEVELS.length-1));storeSave();
  const why=n<3?' '+[!got[1]&&`Янтаря ${gems-gems0} из ${level.amber}.`,!got[2]&&'Без потерь — ещё звезда.'].filter(Boolean).join(' '):'';
  const text=`${w.text} Янтарь: ${gems}, очки: ${score}.${why}`;
  if(lvl<LEVELS.length-1){
    state='cleared';
    card(w.title,text,w.btn,`<span class="stars">${starStr(n)}</span>`,[toMap]);
  }else{
    state='done';const rec=score>best;saveBest();
    card(w.title,text,'Карта',`<span class="stars">${starStr(n)}</span><br>${rec?'Новый рекорд!':`Рекорд: ${best}`}`);
  }
}
function pause(){
  if(state!=='play')return;
  state='pause';
  card('Пауза','Рыжик присел отдохнуть. Можно продолжить или начать уровень заново.','Продолжить',null,
    [{label:'Уровень заново',fn:()=>{gems=gems0;score=score0;reset(false);state='play';ov.hidden=true}},toMap]);
}
function gameOver(){
  state='over';const rec=score>best;saveBest();
  card('Конец игры',`Очки: ${score}. Попробуй ещё раз, маяк ждёт.`,'Заново',rec?'Новый рекорд!':`Рекорд: ${best}`,[toMap]);
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
// offline: after the first visit the game opens without internet too (sw.js; a service worker needs http(s), not file://)
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
