/* ---- input: keyboard + on-screen pad ---- */
const $=id=>document.getElementById(id);
const keys={};
const touch={l:false,r:false,j:false};
const canStart=()=>!['play','win'].includes(state);

addEventListener('keydown',e=>{
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(e.code))e.preventDefault();
  if(!keys[e.code]&&(e.code==='Space'||e.code==='ArrowUp'||e.code==='KeyW'||e.code==='KeyZ'))player&&(player.buf=8);
  keys[e.code]=true;
  if((e.code==='Space'||e.code==='Enter')&&canStart())start();
});
addEventListener('keyup',e=>keys[e.code]=false);
[['bl','l'],['br','r'],['bj','j']].forEach(([id,k])=>{
  const b=$(id);
  const on=e=>{e.preventDefault();if(k==='j'&&!touch.j&&player)player.buf=8;touch[k]=true;b.classList.add('on');if(canStart()&&k==='j')start()};
  const off=e=>{e.preventDefault();touch[k]=false;b.classList.remove('on')};
  b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off);
});
const left=()=>keys.ArrowLeft||keys.KeyA||touch.l, right=()=>keys.ArrowRight||keys.KeyD||touch.r;
const jumpHeld=()=>keys.Space||keys.ArrowUp||keys.KeyW||keys.KeyZ||touch.j;
const run=()=>keys.ShiftLeft||keys.ShiftRight||keys.KeyX;
