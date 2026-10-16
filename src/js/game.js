/* ---- game state, level loading, physics, rules ---- */
const T=16,VW=512,VH=240,H=15;
let W,level,checks,respawnAt,grid,player,enemies,sparks,parts,pops,flies,camX,state='menu',gems=0,score=0,lives=3,time=0,flagX=0,winT=0,lvl=0;

/* ---- record ---- */
let best=0;
try{best=parseInt(localStorage.getItem('ryzhik-best'))||0}catch(e){}
function saveBest(){if(score>best){best=score;try{localStorage.setItem('ryzhik-best',best)}catch(e){}}}

/* ---- level loading: ASCII map -> tile grid + objects ---- */
function parseLevel(L){
  if(L.map.length!==H)throw new Error(`Уровень «${L.name}»: нужно ${H} строк, а их ${L.map.length}`);
  const w=L.map[0].length,out={grid:[],beetles:[],hogs:[],bats:[],checks:[],start:[3,12],flag:w-14};
  L.map.forEach((row,y)=>{
    if(row.length!==w)throw new Error(`Уровень «${L.name}», строка ${y+1}: длина ${row.length}, а должна быть ${w}`);
    out.grid.push([...row].map((c,x)=>{
      if(c==='b'){out.beetles.push([x,y]);return '.'}
      if(c==='v'){out.bats.push([x,y]);return '.'}
      if(c==='e'){out.hogs.push([x,y]);return '.'}
      if(c==='@'){out.start=[x,y];return '.'}
      if(c==='!'){out.flag=x;return '.'}
      if(c==='k'){out.checks.push([x,y]);return '.'}
      return c;
    }));
  });
  return out;
}

function reset(full){
  if(full){gems=0;score=0;lives=3;lvl=0;}
  level=parseLevel(LEVELS[lvl]);
  grid=level.grid;W=grid[0].length;flagX=level.flag;
  checks=level.checks.map(([x,y])=>({x,y,lit:false,t:0}));
  respawnAt=level.start;winT=0;
  flies=[...Array(28)].map((_,i)=>({x:(i*173)%W*T,y:40+(i*61)%130,ph:i*1.7}));
  spawn(false);
}
/* puts Ryzhik at the last lit checkpoint (or the start) and brings enemies back;
   the tile grid is kept, so collected amber and broken boxes stay gone */
function spawn(dbl){
  const [sx,sy]=respawnAt;
  player={x:sx*T,y:(sy+1)*T-14,w:12,h:14,vx:0,vy:0,on:false,face:1,coy:0,buf:0,inv:0,dead:0,step:0,dbl,usedDbl:false,fire:false,cool:0};
  sparks=[];
  enemies=level.beetles.map(([x,y])=>({type:'beetle',x:x*T+1,y:(y+1)*T-12,w:14,h:12,vx:-0.55,alive:true,squash:0}));
  level.hogs.forEach(([x,y])=>enemies.push({type:'hog',x:x*T+1,y:(y+1)*T-11,w:14,h:11,vx:-0.4,alive:true,squash:0}));
  level.bats.forEach(([x,y])=>enemies.push({type:'bat',x:x*T,x0:x*T,y:y*T,y0:y*T,w:14,h:10,vx:-0.7,alive:true,squash:0,ph:x}));
  // don't drop an enemy right on top of the respawn point
  enemies=enemies.filter(e=>Math.abs(e.x-player.x)>3*T);
  parts=[];pops=[];
  camX=Math.max(0,Math.min(player.x-VW*.4,W*T-VW));
}
const solid=c=>c==='#'||c==='='||c==='B'||c==='G'||c==='P'||c==='u';
const at=(tx,ty)=>(tx<0||tx>=W)?'#':(ty<0||ty>=H)?'.':grid[ty][tx];

/* ---- physics ---- */
function moveX(o){
  o.x+=o.vx;
  const y0=Math.floor(o.y/T),y1=Math.floor((o.y+o.h-1)/T);
  if(o.vx>0){const tx=Math.floor((o.x+o.w)/T);for(let y=y0;y<=y1;y++)if(solid(at(tx,y))){o.x=tx*T-o.w-.01;o.vx=o.isE?-o.vx:0;return true}}
  else if(o.vx<0){const tx=Math.floor(o.x/T);for(let y=y0;y<=y1;y++)if(solid(at(tx,y))){o.x=(tx+1)*T;o.vx=o.isE?-o.vx:0;return true}}
}
function moveY(o,onHead){
  o.y+=o.vy;o.on=false;
  const x0=Math.floor(o.x/T),x1=Math.floor((o.x+o.w-1)/T);
  if(o.vy>0){const ty=Math.floor((o.y+o.h)/T);for(let x=x0;x<=x1;x++)if(solid(at(x,ty))){o.y=ty*T-o.h;o.vy=0;o.on=true;return}}
  else if(o.vy<0){const ty=Math.floor(o.y/T);
    let best=null,bd=99;for(let x=x0;x<=x1;x++)if(solid(at(x,ty))||(onHead&&at(x,ty)==='h')){const d=Math.abs((x+.5)*T-(o.x+o.w/2));if(d<bd){bd=d;best=x}}
    if(best!==null){o.y=(ty+1)*T;o.vy=0;onHead&&onHead(best,ty)}}
}
function bump(tx,ty){
  const c=grid[ty][tx];
  if(c==='G'){grid[ty][tx]='u';gems++;score+=100;pops.push({x:tx*T+8,y:ty*T,t:0,txt:'+100'});beep(988,.1);setTimeout(()=>beep(1319,.15),70);}
  else if(c==='h'){grid[ty][tx]='u';if(ty>0&&!solid(grid[ty-1][tx]))grid[ty-1][tx]='w';score+=200;
    pops.push({x:tx*T+8,y:ty*T,t:0,txt:'!'});[523,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,.09,'triangle',.06),i*50));}
  else if(c==='P'){grid[ty][tx]='u';if(ty>0&&!solid(grid[ty-1][tx]))grid[ty-1][tx]='f';beep(660,.1,'triangle',.06,1320);}
  else if(c==='B'){grid[ty][tx]='.';score+=50;beep(160,.12,'square',.06,60);
    for(let i=0;i<4;i++)parts.push({x:tx*T+4+(i%2)*8,y:ty*T+4+(i>>1)*8,vx:(i%2?1.4:-1.4),vy:-4+(i>>1)*1.5,t:0,c:'#d9924e'});}
  else beep(110,.05);
  enemies.forEach(e=>{if(e.alive&&e.type!=='bat'&&Math.abs(e.x+7-(tx*T+8))<14&&Math.abs(e.y+e.h-ty*T)<3)killEnemy(e,true)});
}
function killEnemy(e,flip){e.alive=false;e.squash=1;e.flip=flip||e.type==='bat';e.vy=e.flip?-2:0;score+=200;beep(523,.06);setTimeout(()=>beep(784,.08),50)}
/* enemy or spikes: with the fern flower Ryzhik only loses the fire, otherwise he dies */
function hurt(){
  const p=player;if(p.inv||p.dead)return;
  if(p.fire){p.fire=false;p.inv=90;p.vy=Math.min(p.vy,-3.5);puff(p.x+6,p.y+7,'#ff8a3d');beep(300,.25,'sawtooth',.05,120);return}
  die();
}
function shoot(){
  const p=player;if(!p.fire||p.dead||p.cool>0||sparks.length>=2)return;
  p.cool=14;sparks.push({x:p.x+(p.face>0?p.w:-6),y:p.y+4,w:6,h:6,vx:4.2*p.face,vy:1,t:0});
  beep(880,.06,'square',.035,440);
}
function die(){
  if(player.dead)return;player.dead=1;player.vy=-6;player.vx=0;beep(392,.5,'triangle',.07,98);
}
function hit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function puff(x,y,c){for(let i=0;i<6;i++)parts.push({x,y,vx:Math.cos(i)*1.2,vy:Math.sin(i)*.6+.5,t:40,c,s:3})}

function update(){
  time++;
  const p=player;
  if(state==='win'){winT++;p.vx=0;p.vy=Math.min(p.vy+.3,3);moveY(p);if(winT===150)levelWon();return}
  if(p.dead){p.dead++;p.vy+=.35;p.y+=p.vy;if(p.dead>110){lives--;
    if(lives<=0)gameOver();
    else spawn(p.dbl)}return}

  const max=run()?3.1:2.0, acc=p.on?.16:.11;
  if(left()){p.vx=Math.max(p.vx-acc,-max);p.face=-1}
  else if(right()){p.vx=Math.min(p.vx+acc,max);p.face=1}
  else{p.vx*=p.on?.8:.95;if(Math.abs(p.vx)<.05)p.vx=0}
  if(p.on){p.coy=6;p.usedDbl=false}else p.coy--;
  if(p.buf>0)p.buf--;
  if(p.buf>0&&p.coy>0){p.vy=-6.4-Math.abs(p.vx)*.25;p.buf=0;p.coy=0;beep(330,.12,'square',.04,660)}
  else if(p.buf>0&&p.dbl&&!p.usedDbl&&p.coy<=0){p.vy=-5.6;p.buf=0;p.usedDbl=true;puff(p.x+6,p.y+14,'#bfeee0');beep(520,.12,'triangle',.05,1040)}
  const g=(p.vy<0&&jumpHeld())?.22:.48;
  p.vy=Math.min(p.vy+g,7.5);
  moveX(p);moveY(p,bump);
  if(p.x<camX)p.x=camX,p.vx=Math.max(0,p.vx);
  if(Math.abs(p.vx)>.1&&p.on)p.step+=Math.abs(p.vx)*.12;
  if(p.inv>0)p.inv--;
  if(p.cool>0)p.cool--;
  if(fireReq){fireReq=false;shoot()}

  // fire sparks: bounce along the ground, burn any enemy they touch
  for(const k of sparks){
    k.t++;k.vy=Math.min(k.vy+.35,6);
    if(moveX(k))k.t=999;
    moveY(k);if(k.on)k.vy=-3.2;
    if(k.x<camX-20||k.x>camX+VW+20||k.y>H*T)k.t=999;
    // spikes catch sparks: anything that touches the spike tips (lower 10 px of the tile) fizzles out
    for(let x=Math.floor(k.x/T);x<=Math.floor((k.x+k.w-1)/T);x++){const ty=Math.floor((k.y+k.h-1)/T);
      if(k.t<999&&at(x,ty)==='^'&&k.y+k.h>ty*T+6){k.t=999;puff(k.x+3,k.y+2,'#9aa0b8');beep(1800,.12,'sawtooth',.02,300)}}
    for(const e of enemies)if(e.alive&&k.t<999&&hit(k,e)){killEnemy(e,true);k.t=999;puff(k.x+3,k.y+3,'#ffc857')}
    if(k.t===999)for(let i=0;i<3;i++)parts.push({x:k.x+3,y:k.y+3,vx:(i-1)*.8,vy:-1-i*.3,t:50,c:'#ff8a3d',s:1.2});
  }
  sparks=sparks.filter(k=>k.t<90);

  // gems, feathers & spikes
  const x0=Math.floor(p.x/T),x1=Math.floor((p.x+p.w-1)/T),y0=Math.floor(p.y/T),y1=Math.floor((p.y+p.h-1)/T);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const c=at(x,y);
    if(c==='o'){grid[y][x]='.';gems++;score+=50;beep(1175,.07,'square',.035)}
    if(c==='f'){grid[y][x]='.';p.dbl=true;score+=500;pops.push({x:x*T+8,y:y*T,t:0,txt:'ПЕРО'});[784,988,1175,1568].forEach((f,i)=>setTimeout(()=>beep(f,.1,'triangle',.05),i*60))}
    if(c==='w'){grid[y][x]='.';p.fire=true;score+=1000;pops.push({x:x*T+8,y:y*T,t:0,txt:'ОГОНЬ'});[523,659,784,1047,1319].forEach((f,i)=>setTimeout(()=>beep(f,.1,'square',.045),i*55))}
    if(c==='^'&&p.y+p.h>y*T+8){if(p.fire&&!p.inv)p.vy=-6;hurt()}}
  if(p.y>H*T+20)die();

  // enemies
  for(const e of enemies){
    if(!e.alive){if(e.flip){e.vy+=.3;e.y+=e.vy}else e.squash++;continue}
    if(e.x>camX+VW+40)continue;
    if(e.type==='bat'){
      e.x+=e.vx;if(Math.abs(e.x-e.x0)>70)e.vx=-e.vx;
      e.y=e.y0+Math.sin((time+e.ph*20)/22)*14;
    }else{
      e.isE=true;moveX(e);
      const ahead=e.vx>0?Math.floor((e.x+e.w+1)/T):Math.floor((e.x-1)/T),fy=Math.floor((e.y+e.h+2)/T);
      if(!solid(at(ahead,fy))||at(ahead,fy-1)==='^')e.vx=-e.vx;
      e.vy=(e.vy||0)+.4;moveY(e);if(e.y>H*T)e.alive=false;
    }
    if(hit(p,e)){
      if(e.type!=='hog'&&p.vy>0&&p.y+p.h-p.vy<=e.y+6){killEnemy(e,false);p.vy=jumpHeld()?-6.5:-4;p.usedDbl=false}
      else hurt();
    }
  }
  // checkpoints: a lantern lights up as Ryzhik passes it
  for(const c of checks){
    if(c.lit){c.t++;continue}
    if(p.x+p.w/2>=c.x*T+8){c.lit=true;respawnAt=[c.x,c.y];
      for(let i=0;i<10;i++)parts.push({x:c.x*T+8,y:c.y*T-14,vx:Math.cos(i*.63)*1.3,vy:Math.sin(i*.63)*1.1-.6,t:40,c:'#ffc857',s:1.5});
      [659,880,1319].forEach((f,i)=>setTimeout(()=>beep(f,.12,'triangle',.05),i*80))}
  }
  // goal
  if(p.x+p.w>=flagX*T+6&&state==='play'){state='win';score+=1000;p.vx=0;[523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,.18,'triangle',.07),i*130))}

  for(const q of parts){q.t++;q.vy+=q.s?.02:.3;q.x+=q.vx;q.y+=q.vy}
  parts=parts.filter(q=>q.t<80);
  for(const q of pops)q.t++;pops=pops.filter(q=>q.t<40);
  camX+=(Math.max(0,Math.min(p.x-VW*.4,W*T-VW))-camX)*.15;
}
