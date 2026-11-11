const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');
const http=require('node:http');
const {createConnector}=require('../instagram-connect');
const {normalizeHandle}=require('../lib/instagram-local');

test('handles accept profile URLs and reject other sites or invalid account names',()=>{
 assert.equal(normalizeHandle('@Test.Account'),'test.account');assert.equal(normalizeHandle('https://www.instagram.com/test.account/'),'test.account');
 for(const value of ['', 'https://evil.example/test','a/b','<script>'])assert.throws(()=>normalizeHandle(value));
});
async function fixture(t) {
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'ganji-connect-test-'));const calls=[];
 const server=createConnector({root,api:{fetchProfile:async()=>({username:'test.account',id:'123'}),fetchAllMedia:async()=>[]},sync:async(directory,handle,token)=>{calls.push({handle,token});return 'Fetched 2 posts.';}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin=`http://127.0.0.1:${server.address().port}`;
 const request=async(route,body,headers={})=>{const response=await fetch(origin+route,{method:body?'POST':'GET',headers:{Origin:origin,'Content-Type':'application/json',...headers},...(body?{body:JSON.stringify(body)}:{})});return {status:response.status,data:await response.json()};};
 t.after(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));await fs.rm(root,{recursive:true,force:true});});return{root,request,calls,origin};
}

test('an initial token is required, then subsequent syncs need only the connected handle',async t=>{
 const f=await fixture(t);assert.equal((await f.request('/api/sync',{handle:'test.account'})).data.needsConnection,true);
 const connected=await f.request('/api/connect',{handle:'@test.account',token:'secret-test-token'});assert.equal(connected.status,200);assert.ok(!JSON.stringify(connected.data).includes('secret-test-token'));
 const status=await f.request('/api/status');assert.equal(status.data.accounts[0].handle,'test.account');assert.ok(!JSON.stringify(status.data).includes('secret-test-token'));
 const synced=await f.request('/api/sync',{handle:'test.account'});assert.equal(synced.status,200);assert.equal(synced.data.synced,true);assert.deepEqual(f.calls,[{handle:'test.account',token:'secret-test-token'}]);
});

test('a mismatched account token is not stored and cross-origin writes are rejected',async t=>{
 const f=await fixture(t);
 assert.equal((await f.request('/api/connect',{handle:'other',token:'test-token'})).status,400);
 assert.deepEqual((await f.request('/api/status')).data.accounts,[]);
 assert.equal((await f.request('/api/connect',{handle:'test.account',token:'test-token'},{Origin:'https://evil.example'})).status,403);
 const status=await new Promise(resolve=>{const req=http.get(f.origin+'/api/status',{headers:{Host:'evil.example'}},res=>{res.resume();resolve(res.statusCode);});req.on('error',error=>{throw error;});});
 assert.equal(status,403);
});
