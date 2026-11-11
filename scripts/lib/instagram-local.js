const fs = require('node:fs');
const path = require('node:path');
const FILE = '.instagram.local.json';
function normalizeHandle(value) {
  let handle=String(value || '').trim();
  if (/^https?:\/\//i.test(handle)) {
    const url=new URL(handle);
    if (!['instagram.com','www.instagram.com'].includes(url.hostname)) throw new Error('Enter an Instagram handle or profile URL.');
    handle=url.pathname.replace(/^\/+|\/+$/g,'');
  }
  handle=handle.replace(/^@/,'').toLowerCase();
  if(!/^[a-z0-9._]{1,30}$/.test(handle)) throw new Error('Enter a valid Instagram handle.');
  return handle;
}
function readConnections(root) {
  try {return Object.assign(Object.create(null), JSON.parse(fs.readFileSync(path.join(root,FILE),'utf8')).accounts || {});}
  catch(error) {if(error.code==='ENOENT')return Object.create(null);throw new Error('The local Instagram connection file could not be read.');}
}
function getConnection(root,handle) {return readConnections(root)[normalizeHandle(handle)];}
function saveConnection(root,handle,connection) {
  const accounts=readConnections(root);accounts[normalizeHandle(handle)]=connection;
  const target=path.join(root,FILE);const temp=target+'.tmp';
  fs.writeFileSync(temp,JSON.stringify({accounts},null,2),{mode:0o600});fs.renameSync(temp,target);
}
module.exports={normalizeHandle,readConnections,getConnection,saveConnection};
