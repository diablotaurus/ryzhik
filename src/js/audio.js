/* ---- sound: tiny Web Audio synth, no files ---- */
let ac=null;
function initAudio(){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}
function beep(f,d=.08,type='square',v=.05,slide=0){
  if(!ac)return;const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;
  if(slide)o.frequency.exponentialRampToValueAtTime(slide,ac.currentTime+d);
  g.gain.setValueAtTime(v,ac.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);
  o.connect(g).connect(ac.destination);o.start();o.stop(ac.currentTime+d);
}
