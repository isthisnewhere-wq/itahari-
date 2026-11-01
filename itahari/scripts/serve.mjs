import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const port = Number(process.env.PORT || 4173);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain; charset=utf-8','.woff2':'font/woff2'};
http.createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let file=path.resolve(root,'.'+pathname);
    if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    try {if((await fs.stat(file)).isDirectory())file=path.join(file,'index.html');}catch{}
    let body; let status=200;
    try{body=await fs.readFile(file);}catch{body=await fs.readFile(path.join(root,'404.html'));file='404.html';status=404;}
    res.writeHead(status,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});res.end(body);
  }catch{res.writeHead(400);res.end('Bad request');}
}).listen(port,'127.0.0.1',()=>console.log(`Bahattar Cafe is running at http://localhost:${port}`));
