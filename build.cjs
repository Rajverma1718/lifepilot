const fs=require('node:fs'),path=require('node:path');
fs.mkdirSync(path.join(__dirname,'dist'),{recursive:true});
for(const file of ['index.html','app.js','model.js','family.js','vault.js','firebase-config.js','style.css','release.css'])fs.copyFileSync(path.join(__dirname,file),path.join(__dirname,'dist',file));
console.log('Built dist from six public application files.');
