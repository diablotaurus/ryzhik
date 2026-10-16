// Собирает игру в один файл dist/ryzhik.html: style.css и js/*.js встраиваются внутрь.
// Запуск: node tools/build.js
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),src=path.join(root,'src'),dist=path.join(root,'dist');
const read=f=>fs.readFileSync(path.join(src,f),'utf8');

let html=read('index.html')
  .replace(/<link rel="stylesheet" href="(?!https?:)([^"]+)">/g,(_,f)=>`<style>\n${read(f)}</style>`)
  .replace(/<script src="([^"]+)"><\/script>/g,(_,f)=>`<script>\n${read(f).replace(/<\/script/gi,'<\\/script')}</script>`);

fs.mkdirSync(dist,{recursive:true});
const out=path.join(dist,'ryzhik.html');
fs.writeFileSync(out,html);
console.log(`dist/ryzhik.html — ${(html.length/1024).toFixed(1)} KB`);
