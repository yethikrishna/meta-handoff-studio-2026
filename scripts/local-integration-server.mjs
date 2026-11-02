// Test-only HTTP harness. Never deployed. Binds to loopback and exposes the latest
// synthetic email code only at /__test__/mail-code for end-to-end local testing.
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {readFile} from 'node:fs/promises';
import {extname,join,normalize} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {webcrypto} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import worker from '../src/worker.js';
globalThis.crypto ??= webcrypto;
const root=new URL('../',import.meta.url).pathname,db=new DatabaseSync(':memory:');db.exec(await readFile(join(root,'migrations/0001_auth_and_private_fixtures.sql'),'utf8'));
const sql={prepare(q){const s=db.prepare(q);return{bind(...v){return{first:async()=>s.get(...v)??null,all:async()=>({results:s.all(...v)}),run:async()=>{const r=s.run(...v);return{meta:{changes:Number(r.changes)}}}}}}}};
let latestCode=null;
const env={DB:sql,SESSION_SECRET:'local-test-secret-only',LIMITS:{limit:async()=>({success:true})},MAIL:{async send({to,text}){const match=text.match(/code is (\d{6})/);latestCode=match?.[1]||null;}},AI:{run:async()=>({response:'{"recipient":"finance-agent","dataTypes":["invoice-total"],"action":"summarize"}'})},ASSETS:{async fetch(request){return staticFile(new URL(request.url).pathname)}}};
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8'};
async function staticFile(path){const rel=normalize(decodeURIComponent(path)).replace(/^([/\\]|\.\.(?:[/\\]|$))+/, '');const file=join(root,'public',rel||'index.html');if(!file.startsWith(join(root,'public')))return new Response('not found',{status:404});try{return new Response(await readFile(file),{headers:{'content-type':types[extname(file)]||'application/octet-stream'}})}catch{return new Response('not found',{status:404})}}
const server=createServer(async(req,res)=>{let chunks=[];for await(const c of req)chunks.push(c);const body=Buffer.concat(chunks);if(req.url==='/__test__/mail-code'&&req.method==='GET'){const payload=JSON.stringify({code:latestCode});res.writeHead(200,{'content-type':'application/json','cache-control':'no-store'});res.end(payload);return}const request=new Request(`http://127.0.0.1:8790${req.url}`,{method:req.method,headers:req.headers,body:['GET','HEAD'].includes(req.method)?undefined:body});try{const response=await worker.fetch(request,env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()))}catch(e){res.writeHead(500,{'content-type':'application/json'});res.end(JSON.stringify({error:'local_harness_error'}))}});
if(process.argv[1] && fileURLToPath(import.meta.url)===resolve(process.argv[1]))server.listen(8790,'127.0.0.1',()=>console.log('LOCAL TEST HARNESS ONLY http://127.0.0.1:8790'));
export {server,env,db};
