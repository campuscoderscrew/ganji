const {spawn}=require('node:child_process');
const path=require('node:path');
const children=[];let stopped=false;
function stop(code=0){if(stopped)return;stopped=true;children.forEach(child=>child.kill());process.exitCode=code;}
for(const script of ['scripts/instagram-connect.js','node_modules/react-scripts/scripts/start.js']) {
 const child=spawn(process.execPath,[path.resolve(__dirname,'..',script)],{stdio:'inherit',windowsHide:true,env:{...process.env,BROWSER:process.env.BROWSER || 'none'}});
 children.push(child);child.on('error',error=>{console.error(error.message);stop(1);});child.on('exit',code=>stop(code || 0));
}
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
