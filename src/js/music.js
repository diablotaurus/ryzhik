/* ---- music: tiny chiptune sequencer on Web Audio, one loop per level theme ----
   Tracks are written as space-separated eighth notes: "A4" plays a note, "." holds the previous one,
   "-" is silence, "|" is just a bar line for reading. */
const TRACKS={
  valley:{bpm:96,
    lead:'G4 . B4 D5 E5 . D5 . | B4 . A4 G4 A4 . . . | G4 . B4 D5 G5 . E5 . | D5 . B4 A4 G4 . . -',
    bass:'G2 . . . D3 . . . | C3 . . . G2 . . . | E2 . . . B2 . . . | D3 . . . D3 . . .'},
  cave:{bpm:84,leadType:'triangle',
    lead:'A4 . . E5 . . C5 . | B4 . . G4 . . - - | A4 . . E5 . . F5 . | E5 . . B4 . . - -',
    bass:'A2 . . . . . . . | G2 . . . . . . . | F2 . . . . . . . | E2 . . . . . . .'},
  forest:{bpm:100,
    lead:'E5 . D5 B4 . . G4 . | A4 . B4 D5 . . - - | E5 . D5 B4 . . A4 . | G4 . A4 B4 . . - -',
    bass:'E2 . . . B2 . . . | D3 . . . A2 . . . | C3 . . . G2 . . . | B2 . . . B2 . . .'}
};
const NOTE={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const freq=n=>440*Math.pow(2,(NOTE[n[0]]+(n[1]==='#'?1:0)+12*(+n[n.length-1]+1)-69)/12);
function parseTrack(s){
  const steps=s.split(/\s+/).filter(t=>t&&t!=='|'),out=[];
  steps.forEach((t,i)=>{if(t==='.'||t==='-')return;let len=1;while(steps[i+len]==='.')len++;out.push({i,len,f:freq(t)})});
  return {notes:out,steps:steps.length};
}

let musicOn=true;
try{musicOn=localStorage.getItem('ryzhik-music')!=='off'}catch(e){}
const music={track:null,bus:null,next:0,step:0,timer:null,
  set(name){
    if(!ac||!musicOn)name=null;
    if(name===this.track)return;
    this.stop();this.track=name;if(!name)return;
    const t=TRACKS[name];this.parts=[[parseTrack(t.lead),t.leadType||'square',.022],[parseTrack(t.bass),'triangle',.05]];
    this.bus=ac.createGain();this.bus.gain.value=1;this.bus.connect(ac.destination);
    this.dt=60/t.bpm/2;this.step=0;this.next=ac.currentTime+.08;
    this.timer=setInterval(()=>this.tick(),40);this.tick();
  },
  tick(){ // schedule everything that starts within the next 150 ms
    while(this.next<ac.currentTime+.15){
      for(const [p,type,vol] of this.parts){
        const s=this.step%p.steps;
        for(const n of p.notes)if(n.i===s)this.voice(n.f,this.next,n.len*this.dt,type,vol);
      }
      this.step++;this.next+=this.dt;
    }
  },
  voice(f,t0,d,type,vol){
    const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;
    g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol,t0+.01);
    g.gain.setValueAtTime(vol*.7,t0+Math.min(.08,d*.5));g.gain.linearRampToValueAtTime(0,t0+d*.95);
    o.connect(g).connect(this.bus);o.start(t0);o.stop(t0+d);
  },
  stop(){
    clearInterval(this.timer);this.timer=null;
    if(this.bus){const b=this.bus;b.gain.setTargetAtTime(0,ac.currentTime,.05);setTimeout(()=>b.disconnect(),400);this.bus=null}
    this.track=null;
  }
};
function toggleMusic(){
  musicOn=!musicOn;try{localStorage.setItem('ryzhik-music',musicOn?'on':'off')}catch(e){}
  if(!musicOn)music.stop();
}
// a hidden tab keeps setInterval running — pause all sound with it
document.addEventListener('visibilitychange',()=>{if(!ac)return;document.hidden?ac.suspend():ac.resume()});
