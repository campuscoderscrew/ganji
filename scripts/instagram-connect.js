const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {spawn}=require('node:child_process');
const api=require('./lib/instagram-api');
const {normalizeHandle,readConnections,getConnection,saveConnection}=require('./lib/instagram-local');
const ROOT=path.resolve(__dirname,'..');

function runSync(root,handle,token) {
 return new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,[path.join(ROOT,'scripts/sync-instagram.js'),'--handle',handle,'--no-refresh'],{cwd:root,env:{...process.env,IG_ACCESS_TOKEN:token,IG_HANDLE:handle},windowsHide:true});
  let output='';const append=data=>{output=(output+data.toString()).slice(-12000);};child.stdout.on('data',append);child.stderr.on('data',append);
  child.on('error',()=>reject(new Error('The importer could not be started.')));
  child.on('close',code=>{const cleaned=output.split(token).join('[redacted]').replace(/access_token=[^&\s]+/g,'access_token=[redacted]');if(code)reject(new Error(cleaned || 'Instagram sync failed.'));else resolve(cleaned);});
 });
}
function createConnector(options={}) {
 const root=options.root || ROOT;const provider=options.api || api;const sync=options.sync || runSync;let busy=false;
 return http.createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Content-Security-Policy',"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
  const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data));};
  try {
   const host=new URL('http://'+req.headers.host);
   if(!['127.0.0.1','localhost','[::1]'].includes(host.hostname))return json(403,{error:'This connection tool is local only.'});
   const url=new URL(req.url,host);
   if(req.method==='GET' && url.pathname==='/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});return res.end(fs.readFileSync(path.join(__dirname,'instagram-connect.html')));}
   if(req.method==='GET' && url.pathname==='/api/status')return json(200,{accounts:Object.entries(readConnections(root)).map(([handle,account])=>({handle,connectedAt:account.connectedAt})),busy});
   if(req.method!=='POST' || !['/api/connect','/api/sync'].includes(url.pathname))return json(404,{error:'Not found.'});
   if(req.headers.origin!==host.origin || !(req.headers['content-type'] || '').startsWith('application/json'))return json(403,{error:'Request origin is not allowed.'});
   if(busy)return json(409,{error:'A connection or sync is already running. Please wait.'});
   let body='';for await(const chunk of req){body+=chunk;if(body.length>10000)throw new Error('Request is too large.');}
   const data=JSON.parse(body);const handle=normalizeHandle(data.handle);
   busy=true;
   try {
    if(url.pathname==='/api/connect') {
     const token=typeof data.token==='string'?data.token.trim():'';
     if(!token || token.length>4096)throw new Error('The first connection needs an Instagram API access token from the account owner.');
     let profile;try{profile=await provider.fetchProfile({token});}catch{throw new Error('Instagram did not accept that token. Check that it is an Instagram Login token with media-read permission.');}
     if(normalizeHandle(profile.username)!==handle)throw new Error(`That token belongs to @${profile.username}, not @${handle}. Authorize the matching account.`);
     // Check media permissions before remembering a credential.
     try{await provider.fetchAllMedia({token,maxPages:1,limit:1});}catch{throw new Error('The token cannot read this account’s posts. Check instagram_business_basic permission.');}
     saveConnection(root,handle,{token,id:profile.id || profile.user_id,connectedAt:new Date().toISOString()});
     return json(200,{connected:true,handle});
    }
    const account=getConnection(root,handle);
    const token=account?.token || process.env.IG_ACCESS_TOKEN;
    if(!token)return json(409,{error:`@${handle} needs a one-time authorized connection. A handle alone does not grant access to Instagram posts.`,needsConnection:true});
    const output=await sync(root,handle,token);
    return json(200,{handle,synced:true,output});
   }finally{busy=false;}
  }catch(error){return json(400,{error:error.message || 'The connection could not be completed.'});}
 });
}
if(require.main===module){const server=createConnector();server.listen(Number(process.env.IG_CONNECT_PORT || 4317),'127.0.0.1',()=>console.log(`Instagram connection: http://127.0.0.1:${process.env.IG_CONNECT_PORT || 4317}`));}
module.exports={createConnector};
