const fs=require('fs'); const path=require('path'); 
const edges=[['app','lib'],['app','components'],['app','supabase'],['components','lib'],['src/app','src/lib'],['src/app','src/components'],['apps/web/src/app','apps/web/src/lib']]; 
const m=['graph TD']; 
edges.forEach(([a,b])=>{if(fs.existsSync(a)&&fs.existsSync(b)) m.push(`${a}-->${b}`);}); 
fs.writeFileSync('docs/architecture/01_dependency_graph.mmd',m.join('\n'));
