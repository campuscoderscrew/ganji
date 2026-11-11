const {test,expect}=require('@playwright/test');
const path=require('node:path');
const fs=require('node:fs');
const fixture=path.resolve('src/ganjiLogoWhite.png');
async function preview(page) {await page.goto('/admin');await page.getByRole('button',{name:'Try local preview'}).click();}
async function savePreview(page) {await page.getByRole('button',{name:'Save preview',exact:true}).click();await expect(page.locator('.admin-status')).toContainText('Preview saved');}
test('local preview keeps undated events and never sends a GitHub request',async({page})=>{
 const requests=[];await page.route('https://api.github.com/**',route=>{requests.push(route.request().url());return route.abort();});
 await preview(page);await page.getByRole('button',{name:'+ New event'}).click();await page.getByLabel('Title',{exact:true}).fill('Undated preview event');await page.getByRole('button',{name:'Done',exact:true}).click();await savePreview(page);
 await page.goto('/archive');await expect(page.getByText('Undated events',{exact:true})).toBeVisible();await expect(page.getByText('Undated preview event',{exact:true})).toBeVisible();
 await page.goto('/admin');await expect(page.getByText('Undated preview event',{exact:true})).toBeVisible();expect(requests).toEqual([]);
});

test('photo, officer, About, and performance edits reach public pages in mobile preview',async({page})=>{
 await page.setViewportSize({width:375,height:900});page.on('dialog',dialog=>dialog.accept());await preview(page);
 await page.getByRole('button',{name:'Officers',exact:true}).click();await page.getByRole('button',{name:'+ New officer'}).click();await page.getByLabel('Name',{exact:true}).fill('Preview officer');await page.getByLabel('Position',{exact:true}).fill('Coordinator');
 await page.locator('input[type=file]').setInputFiles(fixture);await expect(page.locator('.admin-photo-picker > img')).toHaveAttribute('src',/^data:image/);await page.getByRole('button',{name:'Done',exact:true}).click();await savePreview(page);
 await page.goto('/officers');const officer=page.locator('.board-member').filter({hasText:'Preview officer'});await expect(officer).toContainText('Coordinator');await expect(officer.locator('img')).toHaveAttribute('src',/^data:image/);
 await page.goto('/admin');await page.getByRole('button',{name:'About',exact:true}).click();await page.getByRole('button',{name:'Edit About'}).click();await page.getByRole('textbox',{name:'Club description',exact:true}).fill('Edited club description');await page.getByLabel('Officer year',{exact:true}).fill('2026-2027');await page.getByLabel('Contact email',{exact:true}).fill('club@example.com');
 await page.getByRole('group',{name:'Group photo',exact:true}).getByLabel('Choose photo').selectOption({label:'ganjiLogoWhite'});await page.getByRole('button',{name:'Done',exact:true}).click();await savePreview(page);
 await page.goto('/about');await expect(page.getByText('Edited club description',{exact:true})).toBeVisible();await expect(page.getByRole('link',{name:'Email us'})).toHaveAttribute('href','mailto:club@example.com');await expect(page.locator('.about-photo img')).toHaveAttribute('src',/^data:image/);
 await page.goto('/admin');await page.getByRole('button',{name:'Performances',exact:true}).click();await page.getByRole('button',{name:'+ New performance'}).click();await page.getByLabel('Title',{exact:true}).fill('Preview stage');await page.getByLabel('Date',{exact:true}).fill('2026-12-01');await page.getByRole('textbox',{name:'Description',exact:true}).fill('A preview performance');await page.getByRole('button',{name:'Done',exact:true}).click();await savePreview(page);
 await page.goto('/performances');await expect(page.locator('.performances-spotlight')).toContainText('Preview stage');
 await page.goto('/admin');await page.getByRole('button',{name:'Photos',exact:true}).click();await expect(page.getByLabel('Photo name')).toHaveValue('ganjiLogoWhite');await page.getByLabel('Photo name').fill('Club portrait');await savePreview(page);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'test-results/admin-photos-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Officers',exact:true}).click();const record=page.locator('.admin-content-record').filter({hasText:'Preview officer'});await record.getByRole('button',{name:'Delete',exact:true}).click();await savePreview(page);await page.goto('/officers');await expect(page.getByText('Preview officer',{exact:true})).toHaveCount(0);
});

test('GitHub publishing commits photos and content atomically without real network writes',async({page})=>{
 let blobs=0,saved,tree,ref;const admin=JSON.parse(fs.readFileSync('src/data/admin-data.json','utf8'));
 await page.route('https://api.github.com/**',async route=>{
  const req=route.request(),url=new URL(req.url()),body=req.postData()?req.postDataJSON():null;let data;
  if(url.pathname==='/user')data={login:'test-officer',avatar_url:''};
  else if(url.pathname.includes('/contents/'))data={sha:'original-json',content:Buffer.from(JSON.stringify(admin)).toString('base64')};
  else if(url.pathname.includes('/git/ref/heads/'))data={object:{sha:'head-commit'}};
  else if(url.pathname.endsWith('/git/commits/head-commit'))data={tree:{sha:'base-tree'}};
  else if(url.pathname.endsWith('/git/blobs')){blobs++;if(blobs===2)saved=JSON.parse(Buffer.from(body.content,'base64').toString('utf8'));data={sha:'blob-'+blobs};}
  else if(url.pathname.endsWith('/git/trees')){tree=body;data={sha:'new-tree'};}
  else if(url.pathname.endsWith('/git/commits'))data={sha:'new-commit'};
  else if(url.pathname.includes('/git/refs/heads/')){ref=body;data={object:{sha:'new-commit'}};}
  else data={permissions:{push:true}};
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
 });
 await page.goto('/admin');await page.getByLabel('Access token').fill('fake-test-token');await page.getByRole('button',{name:'Connect',exact:true}).click();await page.getByRole('button',{name:'Photos',exact:true}).click();await page.locator('input[type=file]').setInputFiles(fixture);await expect(page.getByLabel('Photo name')).toHaveValue('ganjiLogoWhite');await page.getByRole('button',{name:'Save to site',exact:true}).click();await expect(page.locator('.admin-status')).toContainText('Saved.');
 expect(saved.content.photos).toHaveLength(1);expect(tree.base_tree).toBe('base-tree');expect(tree.tree).toHaveLength(2);expect(ref).toEqual({sha:'new-commit',force:false});
});

