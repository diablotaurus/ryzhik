// Ставит символы на карты уровней: node tools/setcell.js <уровень(с 0)> x,y,символ [x,y,символ ...]
// Меняет только пустые клетки (.) и врагов (b e v), чтобы случайно не затереть землю.
const fs=require('fs'),path=require('path');
const file=path.join(__dirname,'..','src','js','levels.js');
const [lvl,...cells]=process.argv.slice(2);
const lines=fs.readFileSync(file,'utf8').split('\n');
let cur=-1,row=-1;const rows={};
lines.forEach((l,i)=>{if(l.includes('map:[')){cur++;row=-1}else if(cur===+lvl&&/^\s+'/.test(l)&&row<14)rows[++row]=i});
for(const c of cells){const [x,y,ch]=c.split(',');const i=rows[y],q=lines[i].indexOf("'")+1+(+x);
  if(!'.bev'.includes(lines[i][q]))throw new Error(`клетка ${x},${y} занята: «${lines[i][q]}»`);
  lines[i]=lines[i].slice(0,q)+ch+lines[i].slice(q+1)}
fs.writeFileSync(file,lines.join('\n'));
console.log('ok',cells.join(' '));
