const fs=require('fs'); const path=require('path'); let out='# API Inventory\n\n';
function walk(dir){if(!fs.existsSync(dir))return[]; return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>{const p=path.join(dir,d.name); return d.isDirectory()?walk(p):[p];});}
const apiDirs=['app/api','apps/web/src/app/api','apps/*/src/app/api'];
let files=[];
apiDirs.forEach(dir=>{if(fs.existsSync(dir)) files.push(...walk(dir));});
files.forEach(f=>{try{const code=fs.readFileSync(f,'utf8'); const runtime=code.match(/export const runtime\s*=\s*["'`](.*?)["'`]/)?.[1]||'node'; out+=`- \`${f}\` — runtime: **${runtime}**\n`;}catch(_){}});
fs.writeFileSync('docs/architecture/02_api_inventory.md',out);
