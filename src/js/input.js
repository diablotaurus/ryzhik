/* ---- input: keyboard + on-screen pad ---- */
const $=id=>document.getElementById(id);
const keys={};
const touch={l:false,r:false,j:false,f:false};
let fireReq=false;
const canStart=()=>!['play','win'].includes(state);

addEventListener('keydown',e=>{
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(e.code))e.preventDefault();
  if(!keys[e.code]&&(e.code==='Space'||e.code==='ArrowUp'||e.code==='KeyW'||e.code==='KeyZ'))player&&(player.buf=8);
  if(!keys[e.code]&&(e.code==='KeyC'||e.code==='KeyF'||e.code==='KeyJ'))fireReq=true;
  keys[e.code]=true;
  if(e.code==='KeyM'&&!e.repeat)toggleMusic();
  if((e.code==='Space'||e.code==='Enter')&&canStart())start();
});
addEventListener('keyup',e=>keys[e.code]=false);
[['bl','l'],['br','r'],['bj','j'],['bf','f']].forEach(([id,k])=>{
  const b=$(id);
  const on=e=>{e.preventDefault();if(k==='j'&&!touch.j&&player)player.buf=8;if(k==='f')fireReq=true;touch[k]=true;b.classList.add('on');if(canStart()&&k==='j')start()};
  const off=e=>{e.preventDefault();touch[k]=false;b.classList.remove('on')};
  b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off);
});
// iOS Safari ignores user-scalable=no for pinch and still zooms on a quick double tap — block those gestures
['gesturestart','gesturechange','gestureend','dblclick'].forEach(t=>document.addEventListener(t,e=>e.preventDefault(),{passive:false}));
document.addEventListener('touchstart',e=>{if(e.touches.length>1)e.preventDefault()},{passive:false});
// the pinch itself arrives as touchmove (iOS reports e.scale≠1); only a one-finger drag inside the menu card may scroll
document.addEventListener('touchmove',e=>{if(e.touches.length>1||(e.scale&&e.scale!==1)||!e.target.closest('.card'))e.preventDefault()},{passive:false});
let lastTouchEnd=0;
document.addEventListener('touchend',e=>{const now=Date.now();if(now-lastTouchEnd<350&&!e.target.closest('.btn'))e.preventDefault();lastTouchEnd=now},{passive:false});
const left=()=>keys.ArrowLeft||keys.KeyA||touch.l, right=()=>keys.ArrowRight||keys.KeyD||touch.r;
const jumpHeld=()=>keys.Space||keys.ArrowUp||keys.KeyW||keys.KeyZ||touch.j;
const run=()=>keys.ShiftLeft||keys.ShiftRight||keys.KeyX;
