/* ---- drawing ---- */
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
let SC=1;const sn=v=>Math.round(v*SC)/SC;
const R=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(sn(x),sn(y),w,h)};
const THEMES={
  valley:{sky:['#1d1a3f','#4a2f63','#b8566b'],grass:['#5fbf8f','#3e8c66','#7fdcab'],dirt:['#6b3f2a','#5a3322'],
    stone:['#8a8fa8','#b3b8cc','#5d6178','#6d7290','#a3a8bf'],spike:'#cfd3e6'},
  forest:{sky:['#060a1c','#122039','#24465a'],grass:['#3f8f6b','#2a6650','#62b48d'],dirt:['#3b2a24','#2e201b'],
    stone:['#7a5a3c','#a07c54','#4f3826','#5f452e','#8e6c48'],spike:'#9cc49a'}
};
const th=()=>THEMES[LEVELS[lvl].theme];
function moon(mx,my,mr,crescent){
  const gl=ctx.createRadialGradient(mx,my,mr*.6,mx,my,mr*3.2);gl.addColorStop(0,'rgba(255,217,160,.3)');gl.addColorStop(1,'rgba(255,217,160,0)');
  ctx.fillStyle=gl;ctx.beginPath();ctx.arc(mx,my,mr*3.2,0,7);ctx.fill();
  if(crescent){ctx.save();ctx.beginPath();ctx.rect(0,0,VW,VH);ctx.moveTo(mx+5+mr*.9,my-3);ctx.arc(mx+5,my-3,mr*.9,0,Math.PI*2,true);ctx.clip('evenodd');
    ctx.fillStyle='#ffe2b3';ctx.beginPath();ctx.arc(mx,my,mr,0,7);ctx.fill();ctx.restore();return}
  ctx.fillStyle='#ffe2b3';ctx.beginPath();ctx.arc(mx,my,mr,0,7);ctx.fill();
  ctx.fillStyle='#f2c98f';[[-3,-3,2.6],[4,2,2],[-1,5,1.5],[5,-5,1.1]].forEach(([dx,dy,r])=>{ctx.beginPath();ctx.arc(mx+dx,my+dy,r,0,7);ctx.fill()});
}
function pines(par,base,col,gap,size,seed){
  ctx.fillStyle=col;const off=camX*par,k0=Math.floor(off/gap)-1;
  for(let k=k0;k<k0+VW/gap+3;k++){
    const h=size*(.7+((k*7919+seed)%13)/20),sx=k*gap-off+((k*31+seed)%gap)*.4;
    ctx.fillRect(sx-1.5,base-h*.25,3,h*.3+40);
    for(let j=0;j<3;j++){const w=h*(.55-j*.12),y=base-h*.15-j*h*.28;
      ctx.beginPath();ctx.moveTo(sx-w,y);ctx.lineTo(sx,y-h*.42);ctx.lineTo(sx+w,y);ctx.fill()}
  }
  ctx.fillRect(0,base+5,VW,VH);
}
function drawBg(){
  const t=th(),gr=ctx.createLinearGradient(0,0,0,VH);gr.addColorStop(0,t.sky[0]);gr.addColorStop(.55,t.sky[1]);gr.addColorStop(1,t.sky[2]);
  ctx.fillStyle=gr;ctx.fillRect(0,0,VW,VH);
  for(let i=0;i<40;i++){const sx=((i*97)%VW - camX*.05+VW*4)%VW,sy=(i*53)%110;R(sx,sy,1,1,i%5?'#ffffff66':'#ffe9b0')}
  if(LEVELS[lvl].theme==='valley'){
    moon(411-camX*.03,41,11,false);
    const layer=(par,base,amp,col,step)=>{ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,VH);
      for(let x=0;x<=VW;x+=8){const wx=x+camX*par;ctx.lineTo(x,base-Math.abs(Math.sin(wx/step))*amp-Math.sin(wx/(step*.37))*amp*.25)}
      ctx.lineTo(VW,VH);ctx.fill()};
    layer(.15,170,50,'#3a2752',90);layer(.35,190,34,'#2a2140',55);
  }else{
    moon(90-camX*.03,38,10,true);
    pines(.12,150,'#122a3c',34,70,3);
    pines(.3,175,'#0d2030',46,90,11);
    for(const f of flies){
      const fx=((f.x-camX*.6+Math.sin(time/70+f.ph)*24)%(VW+40)+VW+40)%(VW+40)-20,fy=f.y+Math.sin(time/45+f.ph*2)*10;
      const a=.35+.65*Math.max(0,Math.sin(time/25+f.ph*3));
      const fg=ctx.createRadialGradient(fx,fy,0,fx,fy,5);fg.addColorStop(0,`rgba(222,255,150,${a*.55})`);fg.addColorStop(1,'rgba(222,255,150,0)');
      ctx.fillStyle=fg;ctx.beginPath();ctx.arc(fx,fy,5,0,7);ctx.fill();
      ctx.fillStyle=`rgba(245,255,200,${a})`;ctx.beginPath();ctx.arc(fx,fy,1,0,7);ctx.fill();
    }
  }
}
function tile(c,x,y,tx,ty){
  const t=th();
  if(c==='#'){const top=at(tx,ty-1)!=='#';R(x,y,T,T,t.dirt[0]);R(x+2,y+6,3,3,t.dirt[1]);R(x+10,y+11,3,2,t.dirt[1]);
    if(top){R(x,y,T,5,t.grass[0]);R(x,y+5,T,1,t.grass[1]);R(x+3,y-1,2,1,t.grass[2]);R(x+11,y-1,2,1,t.grass[2])}}
  else if(c==='='){const L=at(tx-1,ty)==='=',Rt=at(tx+1,ty)==='=',s=t.stone;
    R(x,y,T,T,s[0]);R(x,y,T,2,s[1]);R(x,y+T-2,T,2,s[2]);
    if(L)R(x,y+2,1,12,s[3]);else R(x,y,1,T-2,s[4]);
    if(!Rt)R(x+T-1,y+2,1,T-2,s[2]);
    if(LEVELS[lvl].theme==='forest'){R(x+3,y+6,6,1,s[3]);R(x+8,y+10,5,1,s[3]);if(!L&&!at(tx,ty-1).match(/=/))R(x+1,y-1,3,1,t.grass[2])}}
  else if(c==='B'){R(x,y,T,T,'#c27a3c');R(x+1,y+1,14,14,'#d9924e');R(x+1,y+7,14,2,'#a5622b');R(x+7,y+1,2,6,'#a5622b');R(x+3,y+9,2,6,'#a5622b');R(x+11,y+9,2,6,'#a5622b')}
  else if(c==='G'){const b=Math.sin(time/12+tx)*.5+.5;R(x,y,T,T,'#4b3f6b');R(x+1,y+1,14,14,'#6a5a96');
    ctx.fillStyle=`rgb(255,${180+b*40|0},${70+b*30|0})`;ctx.beginPath();ctx.moveTo(x+8,y+3);ctx.lineTo(x+12,y+8);ctx.lineTo(x+8,y+13);ctx.lineTo(x+4,y+8);ctx.fill();R(x+7,y+5,2,2,'#fff8')}
  else if(c==='P'){const b=Math.sin(time/9)*.5+.5;R(x,y,T,T,'#2f5d57');R(x+1,y+1,14,14,'#3f7f74');feather(x+8,y+8,.8,`rgba(220,255,240,${.7+b*.3})`)}
  else if(c==='u'){R(x,y,T,T,'#3a3150');R(x+1,y+1,14,14,'#4a405f')}
  else if(c==='o'){const s=Math.abs(Math.sin(time/10+tx*.7));const w=Math.max(2,Math.round(8*s));
    ctx.fillStyle='#ffc857';ctx.beginPath();ctx.moveTo(x+8,y+3);ctx.lineTo(x+8+w/2,y+8);ctx.lineTo(x+8,y+13);ctx.lineTo(x+8-w/2,y+8);ctx.fill();R(x+7,y+5,1,2,'#fff')}
  else if(c==='f'){const fy=y+8+Math.sin(time/12)*2;
    ctx.fillStyle='rgba(191,238,224,.25)';ctx.beginPath();ctx.arc(x+8,fy,8,0,7);ctx.fill();feather(x+8,fy,1,'#e8fff6')}
  else if(c==='^'){ctx.fillStyle=t.spike;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x+i*5+1,y+T);ctx.lineTo(x+i*5+3.5,y+6);ctx.lineTo(x+i*5+6,y+T);ctx.fill()}}
}
function feather(cx,cy,s,col){
  ctx.save();ctx.translate(cx,cy);ctx.rotate(-.6);ctx.scale(s,s);
  ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(0,-1,2.6,6,0,0,7);ctx.fill();
  ctx.fillStyle='#5fbf8f';ctx.fillRect(-.4,-6,.8,12);ctx.restore();
}
function drawFox(p){
  const x=sn(p.x-camX),y=sn(p.y),f=p.face;
  if(p.inv&&(time>>2)%2)return;
  ctx.save();ctx.translate(x+6,y);ctx.scale(f,1);ctx.translate(-6,0);
  const leg=p.on?Math.round(Math.sin(p.step*3)*2):1;
  R(-5,5+Math.round(Math.sin(time/8)),6,4,'#ff8a3d');R(-7,6+Math.round(Math.sin(time/8)),3,3,'#fff3e0');
  R(1,6,10,6,'#ff8a3d');R(3,8,6,4,'#fff3e0');
  R(2,12,3,2+(leg>0?0:1),'#3a2433');R(7,12,3,2+(leg>0?1:0),'#3a2433');
  R(3,0,10,7,'#ff8a3d');R(9,3,5,3,'#fff3e0');R(13,4,1,1,'#2a1a22');
  R(3,-3,3,3,'#ff8a3d');R(9,-3,3,3,'#ff8a3d');R(4,-2,1,2,'#3a2433');R(10,-2,1,2,'#3a2433');
  R(8,2,2,2,'#2a1a22');
  R(2,6,9,2,'#5fbf8f');R(1,7,2,3,'#5fbf8f');
  if(p.dbl){ctx.save();ctx.translate(5,-3);ctx.rotate(-.5);ctx.fillStyle='#e8fff6';ctx.fillRect(-1,-5,2,6);ctx.restore()}
  ctx.restore();
}
function drawBeetle(e){
  const x=sn(e.x-camX),y=sn(e.y);
  if(!e.alive&&!e.flip){if(e.squash>30)return;R(x,y+8,14,4,'#3d6e8f');return}
  ctx.save();if(e.flip){ctx.translate(x,y+12);ctx.scale(1,-1);ctx.translate(-x,-y)}
  const l=(time>>3)%2;
  R(x+1,y+2,12,8,'#2e5878');R(x+2,y+1,10,2,'#4a86ad');R(x+6,y+2,2,8,'#1c3a52');
  R(x+(e.vx<0?0:10),y+5,4,4,'#1c3a52');R(x+(e.vx<0?1:12),y+6,1,1,'#ffc857');
  R(x+2,y+10,2,2-l,'#1c3a52');R(x+6,y+10,2,1+l,'#1c3a52');R(x+10,y+10,2,2-l,'#1c3a52');
  R(x+3,y-1,1,2,'#8fb3cc');R(x+10,y-1,1,2,'#8fb3cc');
  ctx.restore();
}
function drawBat(e){
  const x=e.x-camX,y=e.y,cx=x+7,cy=y+5;
  ctx.save();if(!e.alive){ctx.translate(cx,cy);ctx.scale(1,-1);ctx.translate(-cx,-cy)}
  const flap=e.alive?Math.sin(time/3+e.ph):0;
  ctx.fillStyle='#4b3466';
  for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(cx+s*2,cy-1);ctx.lineTo(cx+s*10,cy-4-flap*4);ctx.lineTo(cx+s*8,cy+1+flap);ctx.lineTo(cx+s*5,cy+3);ctx.fill()}
  ctx.fillStyle='#5d4280';ctx.beginPath();ctx.ellipse(cx,cy+1,4,4.5,0,0,7);ctx.fill();
  R(cx-3,cy-5,2,2,'#5d4280');R(cx+1,cy-5,2,2,'#5d4280');
  R(cx-2,cy,1,1,'#ff8a3d');R(cx+1,cy,1,1,'#ff8a3d');
  ctx.restore();
}
function drawBeacon(){
  const bx=flagX*T-camX;
  if(bx>VW+40||bx<-60)return;
  const by=13*T;
  for(let i=0;i<9;i++){const w=22-i;R(bx-w/2+8,by-(i+1)*12,w,12,i%2?'#f3ecdf':'#d94f4f')}
  R(bx-4,by-120,24,10,'#3a3150');R(bx-1,by-128,18,8,'#5a4f78');
  const lit=state==='win'||state==='cleared';
  const glow=lit?.9:.35+Math.sin(time/20)*.1;
  R(bx+2,by-126,12,6,`rgba(255,200,87,${glow})`);
  if(lit){ctx.fillStyle='rgba(255,200,87,.18)';ctx.beginPath();const a=Math.sin(winT/20)*.6;ctx.moveTo(bx+8,by-123);ctx.lineTo(bx+8+Math.cos(a)*260,by-123-40);ctx.lineTo(bx+8+Math.cos(a)*260,by-123+40);ctx.fill()}
}
function drawHouse(){
  const bx=flagX*T-camX;
  if(bx>VW+80||bx<-80)return;
  const by=13*T,lit=state==='win'||state==='done';
  // chimney + smoke
  R(bx+26,by-62,7,16,'#6b4a3a');
  for(let i=0;i<4;i++){const t=(time/40+i/4)%1;ctx.fillStyle=`rgba(200,210,230,${.35*(1-t)})`;ctx.beginPath();ctx.arc(bx+29+Math.sin(t*6+i)*4,by-66-t*40,3+t*5,0,7);ctx.fill()}
  // walls
  R(bx-10,by-38,52,38,'#8a5a3c');for(let i=0;i<5;i++)R(bx-10,by-36+i*8,52,1,'#6e4630');
  // roof
  ctx.fillStyle='#b8566b';ctx.beginPath();ctx.moveTo(bx-16,by-36);ctx.lineTo(bx+16,by-62);ctx.lineTo(bx+48,by-36);ctx.fill();
  ctx.fillStyle='#8f3f52';ctx.fillRect(bx-16,by-38,64,3);
  // door
  R(bx-2,by-24,12,24,'#4a2f2a');R(bx+7,by-12,2,2,'#ffc857');
  // window
  const wg=lit?1:.55+Math.sin(time/30)*.1;
  if(lit){const g=ctx.createRadialGradient(bx+26,by-20,2,bx+26,by-20,40);g.addColorStop(0,'rgba(255,200,87,.35)');g.addColorStop(1,'rgba(255,200,87,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(bx+26,by-20,40,0,7);ctx.fill()}
  R(bx+19,by-28,14,12,'#3a2433');R(bx+20,by-27,12,10,`rgba(255,200,87,${wg})`);R(bx+25.5,by-27,1,10,'#3a2433');R(bx+20,by-22.5,12,1,'#3a2433');
}

/* ---- HUD: drawn inside the canvas, so it scales with the game and never wraps or hides on phones ---- */
function hudText(s,x,y,col,align){
  ctx.font='8px Silkscreen, monospace';ctx.textAlign=align||'left';ctx.textBaseline='middle';
  ctx.fillStyle='#0009';ctx.fillText(s,x+1,y+1);ctx.fillStyle=col;ctx.fillText(s,x,y);
  const w=ctx.measureText(s).width;ctx.textAlign='start';ctx.textBaseline='alphabetic';return w;
}
function heart(x,y,col){R(x+1,y,2,1,col);R(x+4,y,2,1,col);R(x,y+1,7,2,col);R(x+1,y+3,5,1,col);R(x+2,y+4,3,1,col);R(x+3,y+5,1,1,col)}
function gemIcon(x,y){ctx.fillStyle='#ffc857';ctx.beginPath();ctx.moveTo(x+3.5,y);ctx.lineTo(x+7,y+3.5);ctx.lineTo(x+3.5,y+7);ctx.lineTo(x,y+3.5);ctx.fill();R(x+3,y+2,1,1,'#fff')}
function starIcon(x,y){ctx.fillStyle='#5fbf8f';ctx.beginPath();
  for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?1.6:4;ctx.lineTo(x+4+Math.cos(a)*r,y+4+Math.sin(a)*r)}ctx.fill()}
function drawHud(){
  const g=ctx.createLinearGradient(0,0,0,20);g.addColorStop(0,'rgba(10,10,28,.6)');g.addColorStop(1,'rgba(10,10,28,0)');
  ctx.fillStyle=g;ctx.fillRect(0,0,VW,20);
  const y=9;let x=8;
  for(let i=0;i<3;i++){heart(x,y-3,i<lives?'#ff8a3d':'#ffffff26');x+=10}
  if(player&&player.dbl){feather(x+4,y,.8,'#e8fff6');x+=10}
  x+=6;gemIcon(x,y-3.5);x+=11;
  hudText(String(gems),x,y,'#ffc857');
  hudText(String(score).padStart(6,'0'),VW/2,y,'#f3ecdf','center');
  const w=hudText(String(Math.max(best,score)),VW-8,y,'#5fbf8f','right');
  starIcon(VW-8-w-12,y-4);
  hudText(`${lvl+1}/${LEVELS.length}`,VW-8-w-26,y,'#f3ecdf','right');
}

let lvlBanner=0;
function draw(){
  ctx.setTransform(SC,0,0,SC,0,0);
  drawBg();
  const c0=Math.floor(camX/T),c1=c0+Math.ceil(VW/T)+1;
  for(let ty=0;ty<H;ty++)for(let tx=c0;tx<=c1&&tx<W;tx++){const c=grid[ty][tx];if(c!=='.')tile(c,tx*T-sn(camX),ty*T,tx,ty)}
  if(LEVELS[lvl].theme==='valley')drawBeacon();else drawHouse();
  enemies.forEach(e=>{if(e.x>camX-30&&e.x<camX+VW+30)(e.type==='bat'?drawBat:drawBeetle)(e)});
  for(const q of parts){if(q.s){ctx.fillStyle=q.c;ctx.globalAlpha=Math.max(0,1-(q.t-40)/40);ctx.beginPath();ctx.arc(q.x-camX,q.y,q.s,0,7);ctx.fill();ctx.globalAlpha=1}else R(q.x-camX,q.y,6,6,q.c)}
  for(const q of pops){ctx.fillStyle='#ffc857';ctx.font='8px Silkscreen, monospace';ctx.textAlign='center';ctx.fillText(q.txt,q.x-camX,q.y-8-q.t*.6);ctx.textAlign='start'}
  drawFox(player);
  if(state==='play'&&time<lvlBanner){ctx.fillStyle='rgba(20,20,40,.55)';ctx.fillRect(0,24,VW,26);ctx.fillStyle='#ffc857';ctx.font='12px Silkscreen, monospace';ctx.textAlign='center';ctx.fillText(`Уровень ${lvl+1}: ${LEVELS[lvl].name}`,VW/2,41);ctx.textAlign='start'}
  drawHud();
}
