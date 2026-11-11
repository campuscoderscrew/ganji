const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({
 testDir:'./tests',workers:1,timeout:45000,
 use:{baseURL:'http://127.0.0.1:3000',channel:process.platform==='win32'?'msedge':undefined,headless:true,screenshot:'only-on-failure',trace:'retain-on-failure'},
 webServer:{command:'npm start',url:'http://127.0.0.1:3000',reuseExistingServer:true,env:{HOST:'127.0.0.1',BROWSER:'none'},timeout:120000},
});
