const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const yaml=require('js-yaml');
const text=fs.readFileSync(path.join(__dirname,'../../.github/workflows/sync-instagram.yml'),'utf8');
const workflow=yaml.load(text);
test('workflow uses environment variables instead of secrets in step conditions',()=>{
 const job=workflow.jobs['sync-and-deploy'];
 assert.ok(job.env.IG_ACCESS_TOKEN.includes('secrets.IG_ACCESS_TOKEN'));
 for(const step of job.steps)if(step.if)assert.ok(!step.if.includes('secrets.'),step.name);
 assert.ok(job.steps.find(step=>step.name==='Store refreshed token').if.includes('env.HAS_TOKEN_WRITER'));
});
test('sync, parser checks, publication, and Pages deployment remain present',()=>{
 assert.ok(workflow.on.schedule.length);assert.ok(workflow.on.push.branches.includes('main'));
 const steps=workflow.jobs['sync-and-deploy'].steps;
 assert.ok(steps.some(step=>step.run==='npm run test:parser'));
 assert.ok(steps.some(step=>step.run==='node scripts/sync-instagram.js --prune'));
 assert.ok(steps.some(step=>step.uses==='actions/deploy-pages@v4'));
});
