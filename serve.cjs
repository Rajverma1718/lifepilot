const http=require('http'),fs=require('fs'),path=require('path');http.createServer((q,r)=>{let f=path.join(__dirname,q.url==='/'?'index.html':q.url);if(!fs.existsSync(f)){r.writeHead(404);return r.end('Not found')}r.end(fs.readFileSync(f))}).listen(4195,'127.0.0.1',()=>console.log('LifePilot: http://127.0.0.1:4195'));

