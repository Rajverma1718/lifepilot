import {getFirestore,collection,getDocs,doc,setDoc,deleteDoc} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import {getStorage,ref,uploadBytes,getBlob,deleteObject} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js';
import {escapeHTML as esc} from './model.js';
export async function mountVault(root,user,id,role){
 const db=getFirestore(),storage=getStorage(),manage=['owner','parent'].includes(role);
 const message=document.createElement('p');message.setAttribute('role','status');root.append(message);
 const content=document.createElement('div');root.append(content);
 const run=async fn=>{message.textContent='Saving…';try{await Promise.race([fn(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Cloud connection timed out. Retry after checking your connection.')),15000))]);message.textContent='Saved.'}catch(e){message.textContent=e.message}};
 async function load(){
 const bills=await getDocs(collection(db,'families',id,'bills')),documents=await getDocs(collection(db,'families',id,'documents'));
 content.innerHTML='<h3>Shared family bills</h3>'+bills.docs.map(b=>'<div class="item"><span>'+esc(b.data().name)+' · Rs '+esc(b.data().amount)+' · '+esc(b.data().due)+' · '+(b.data().paid?'Paid':'Unpaid')+'</span>'+(manage?'<button data-pay="'+esc(b.id)+'">'+(b.data().paid?'Reopen':'Mark paid')+'</button>':'')+'</div>').join('')+
 (manage?'<form id="family-bill"><label>Bill name<input name="name" required maxlength="200"></label><label>Amount (Rs)<input type="number" name="amount" required min="0" step="0.01"></label><label>Due date<input type="date" name="due" required></label><button class="primary">Add family bill</button></form>':'')+
 '<h3>Shared family documents</h3><p>Files added here can be downloaded by every current member of this family. Your private documents are not shared automatically.</p>'+documents.docs.map(d=>'<div class="item"><span>'+esc(d.data().name)+'</span><button data-download="'+esc(d.id)+'">Download</button>'+(manage?'<button data-remove-file="'+esc(d.id)+'">Delete</button>':'')+'</div>').join('')+
 (manage?'<form id="family-file"><label>Choose a document to share<input name="file" type="file" accept=".pdf,image/jpeg,image/png,image/webp" required></label><button class="primary">Upload and share with this family</button></form>':'<p>Only the owner and parents can manage family bills and documents.</p>');
 content.querySelectorAll('[data-download]').forEach(b=>b.onclick=()=>run(async()=>{const d=documents.docs.find(d=>d.id===b.dataset.download).data();const blob=await getBlob(ref(storage,d.path));const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=d.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}));
 if(manage){
 content.querySelector('#family-bill').onsubmit=e=>{e.preventDefault();const v=Object.fromEntries(new FormData(e.target));run(async()=>{await setDoc(doc(db,'families',id,'bills',crypto.randomUUID()),{name:v.name.trim(),due:v.due,amount:Number(v.amount),paid:false});await load()})};
 content.querySelectorAll('[data-pay]').forEach(b=>b.onclick=()=>run(async()=>{const d=bills.docs.find(d=>d.id===b.dataset.pay);await setDoc(d.ref,{...d.data(),paid:!d.data().paid});await load()}));
 content.querySelector('#family-file').onsubmit=e=>{e.preventDefault();const file=new FormData(e.target).get('file');run(async()=>{if(!file.size||file.size>10*1024*1024||!['application/pdf','image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Choose a PDF or supported image up to 10 MB.');const fileId=crypto.randomUUID(),path='families/'+id+'/documents/'+fileId;await uploadBytes(ref(storage,path),file,{contentType:file.type});await setDoc(doc(db,'families',id,'documents',fileId),{name:file.name,path});await load()})};
 content.querySelectorAll('[data-remove-file]').forEach(b=>b.onclick=()=>run(async()=>{const d=documents.docs.find(d=>d.id===b.dataset.removeFile);await deleteObject(ref(storage,d.data().path));await deleteDoc(d.ref);await load()}));
 }
 }
 try{await load()}catch(e){message.textContent=e.message}
}
