// Собирает игру в один файл dist/ryzhik.html: style.css и js/*.js встраиваются внутрь.
// Запуск: node tools/build.js
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),src=path.join(root,'src'),dist=path.join(root,'dist');
const read=f=>fs.readFileSync(path.join(src,f),'utf8');

let html=read('index.html')
  .replace(/<link rel="stylesheet" href="(?!https?:)([^"]+)">/g,(_,f)=>`<style>\n${read(f)}</style>`)
  .replace(/<script src="([^"]+)"><\/script>/g,(_,f)=>`<script>\n${read(f).replace(/<\/script/gi,'<\\/script')}</script>`);

// build stamp in the menu: lets you see on a phone whether the fresh version has arrived (Pages caches for 10 min)
let rev='';try{rev=' · '+require('child_process').execSync('git rev-parse --short HEAD',{cwd:root}).toString().trim()}catch(e){}
const now=new Date(),pad=n=>String(n).padStart(2,'0');
html=html.replace('<!--BUILD-->dev',`${pad(now.getDate())}.${pad(now.getMonth()+1)} ${pad(now.getHours())}:${pad(now.getMinutes())}${rev}`);

fs.mkdirSync(dist,{recursive:true});
const out=path.join(dist,'ryzhik.html');
fs.writeFileSync(out,html);
console.log(`dist/ryzhik.html — ${(html.length/1024).toFixed(1)} KB`);
