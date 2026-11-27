const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const publicFiles=new Set(['index.html','app.js','model.js','family.js','vault.js','firebase-config.js','style.css','release.css']);
http.createServer((q,r)=>{const file=new URL(q.url,'http://localhost').pathname.slice(1)||'index.html';if(!publicFiles.has(file)){r.writeHead(404);return r.end('Not found')}const mime=file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8';r.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-cache'});fs.createReadStream(path.join(__dirname,file)).pipe(r)}).listen(4195,'127.0.0.1',()=>console.log('LifePilot: http://127.0.0.1:4195'));

