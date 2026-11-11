import { TextEncoder, TextDecoder } from 'util';
import { saveAdminData, ConflictError } from './github';

global.TextEncoder=TextEncoder;global.TextDecoder=TextDecoder;
const response=(data,status=200)=>Promise.resolve({ok:status<400,status,json:async()=>data});
const file={path:'public/uploads/test-photo.png',content:'aW1hZ2U='};
afterEach(()=>jest.restoreAllMocks());

test('normal saves preserve the existing Contents API and JSON SHA check',async()=>{
  global.fetch=jest.fn(()=>response({content:{sha:'saved-json'}}));
  const result=await saveAdminData({token:'test',data:{overrides:{},manualEvents:[],content:{about:{description:'Club'}}},sha:'original-json',login:'officer'});
  const body=JSON.parse(fetch.mock.calls[0][1].body);
  expect(body.sha).toBe('original-json');expect(body.branch).toBe('main');
  expect(result.sha).toBe('saved-json');
  expect(JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(body.content),c=>c.charCodeAt(0)))) .content.about.description).toBe('Club');
});

function mockAtomic({conflict=false,stale=false}={}) {
  const calls=[];let blobs=0;
  global.fetch=jest.fn((url,options={})=>{
    const body=options.body?JSON.parse(options.body):null;calls.push({url,body,method:options.method});
    if(url.includes('/git/ref/heads/'))return response({object:{sha:'base-commit'}});
    if(url.includes('/contents/'))return response({sha:stale?'newer-json':'original-json'});
    if(url.endsWith('/git/commits/base-commit'))return response({tree:{sha:'base-tree'}});
    if(url.endsWith('/git/blobs'))return response({sha:++blobs===1?'photo-blob':'json-blob'});
    if(url.endsWith('/git/trees'))return response({sha:'new-tree'});
    if(url.endsWith('/git/commits'))return response({sha:'new-commit'});
    if(url.includes('/git/refs/heads/'))return conflict?response({message:'Not a fast forward'},422):response({object:{sha:'new-commit'}});
    throw new Error('Unexpected request '+url);
  });return calls;
}

test('photos and content publish in one commit based on the existing tree',async()=>{
  const calls=mockAtomic();const result=await saveAdminData({token:'test',data:{manualEvents:[],overrides:{}},sha:'original-json',login:'officer',files:[file]});
  const tree=calls.find(call=>call.url.endsWith('/git/trees')).body;
  expect(tree.base_tree).toBe('base-tree');expect(tree.tree.map(item=>item.path)).toEqual(['public/uploads/test-photo.png','src/data/admin-data.json']);
  expect(calls.find(call=>call.url.endsWith('/git/commits')).body.parents).toEqual(['base-commit']);
  expect(calls.at(-1).body).toEqual({sha:'new-commit',force:false});expect(result.sha).toBe('json-blob');
});

test('a stale JSON SHA prevents any upload or commit',async()=>{
  const calls=mockAtomic({stale:true});await expect(saveAdminData({token:'test',data:{},sha:'original-json',login:'officer',files:[file]})).rejects.toBeInstanceOf(ConflictError);
  expect(calls.some(call=>call.method==='POST')).toBe(false);
});

test('a concurrent branch update refuses the publish without forcing the branch',async()=>{
  const calls=mockAtomic({conflict:true});await expect(saveAdminData({token:'test',data:{},sha:'original-json',login:'officer',files:[file]})).rejects.toBeInstanceOf(ConflictError);
  expect(calls.at(-1).body.force).toBe(false);
});
