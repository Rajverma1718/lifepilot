import {getFirestore,doc,collection,setDoc,getDoc,getDocs,deleteDoc,runTransaction} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
let db;
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const timeout=p=>Promise.race([p,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Cloud connection timed out. Please retry.')),12000))]);
export async function mountFamily(root,user){
 db=getFirestore();
 root.innerHTML='<section class="panel"><h2>Family space</h2><p id="family-message" role="status">Loading your family…</p><div id="family-content"></div></section>';
 const message=root.querySelector('#family-message'), content=root.querySelector('#family-content');
 const action=async fn=>{message.textContent='Saving…';try{await timeout(fn());message.textContent='Saved.'}catch(e){message.textContent=e.message}};
 try{
 const pending=new URLSearchParams(location.search).get('invite');
 if(pending){
 const invitation=await timeout(getDoc(doc(db,'familyInvites',pending)));
 if(invitation.exists()){
 const invite=invitation.data();
 content.innerHTML='<h3>Family invitation</h3><p>Join as '+escape(invite.role)+'. Your email must match the invitation and be verified.</p><button class="primary" id="accept">Accept invitation</button>';
 message.textContent='Invitation found.';
 content.querySelector('#accept').onclick=()=>action(async()=>{
 await setDoc(doc(db,'families',invite.familyId,'members',user.uid),{role:invite.role,email:user.email,invitationId:pending});
 await setDoc(doc(db,'users',user.uid,'familyLinks',invite.familyId),{familyId:invite.familyId});
 history.replaceState(null,'',location.pathname);await mountFamily(root,user);
 });return;
 }
 }
 const links=await timeout(getDocs(collection(db,'users',user.uid,'familyLinks')));
 if(links.empty){
 content.innerHTML='<p>Create a family space to share tasks with people you invite. Personal tasks and documents stay private.</p><form id="create-family"><label>Family name<input name="name" required maxlength="80" placeholder="Verma family"></label><button class="primary">Create family</button></form>';
 message.textContent='You have not joined a family yet.';
 content.querySelector('form').onsubmit=e=>{e.preventDefault();const name=new FormData(e.target).get('name').trim();if(!name)return;action(async()=>{const id=crypto.randomUUID();await setDoc(doc(db,'families',id),{name,owner:user.uid});await setDoc(doc(db,'users',user.uid,'familyLinks',id),{familyId:id});await mountFamily(root,user)})};return;
 }
 content.innerHTML='<label>Family<select id="family-select">'+links.docs.map(x=>'<option value="'+escape(x.id)+'">'+escape(x.id)+'</option>').join('')+'</select></label><div id="family-detail"></div>';
 async function show(id){
 const target=content.querySelector('#family-detail');target.innerHTML='<p>Loading shared tasks…</p>';
 const family=await timeout(getDoc(doc(db,'families',id)));if(!family.exists())throw new Error('Family no longer exists.');
 const f=family.data(),owner=f.owner===user.uid;
 const membership=owner?null:await timeout(getDoc(doc(db,'families',id,'members',user.uid)));
 const role=owner?'owner':membership.data()?.role;
 if(!role)throw new Error('Your access was removed.');
 const tasks=await timeout(getDocs(collection(db,'families',id,'tasks')));
 const members=await timeout(getDocs(collection(db,'families',id,'members')));
 const canEdit=['owner','parent','member'].includes(role);
 target.innerHTML='<h2>'+escape(f.name)+'</h2><p>Your role: '+escape(role)+'</p><h3>Members</h3><p>Owner</p>'+members.docs.map(m=>'<div class="item"><span>'+escape(m.data().email)+' · '+escape(m.data().role)+'</span>'+(owner?'<button data-remove="'+escape(m.id)+'" class="ghost">Remove access</button>':'')+'</div>').join('')+
 (owner?'<h3>Invite a person</h3><form id="invite-form"><label>Email<input name="email" type="email" required></label><label>Access<select name="role"><option value="viewer">Viewer — view tasks</option><option value="member">Member — manage tasks</option><option value="parent">Parent — manage tasks</option></select></label><button class="primary">Create invitation link</button></form><p id="invite-link"></p>':'')+
 '<h3>Shared tasks</h3>'+tasks.docs.map(t=>'<div class="item"><span>'+escape(t.data().title)+' · '+escape(t.data().due)+' · '+(t.data().done?'Done':'Open')+'</span>'+(canEdit?'<button class="ghost" data-toggle="'+escape(t.id)+'">'+(t.data().done?'Reopen':'Complete')+'</button>':'')+'</div>').join('')+
 (canEdit?'<form id="shared-task"><label>Task<input name="title" required maxlength="200"></label><label>Due date<input name="due" type="date" required></label><button class="primary">Add shared task</button></form>':'<p>You have view-only access.</p>');
 message.textContent='Family data loaded.';
 if(owner){
 target.querySelector('#invite-form').onsubmit=e=>{e.preventDefault();const values=Object.fromEntries(new FormData(e.target));action(async()=>{const code=crypto.randomUUID();await setDoc(doc(db,'familyInvites',code),{familyId:id,email:values.email.trim().toLowerCase(),role:values.role,expiresAt:Date.now()+7*86400000});const link=new URL(location.href);link.search='';link.searchParams.set('invite',code);const p=target.querySelector('#invite-link');p.textContent='Copy and share this link with the invited person: ';const a=document.createElement('a');a.href=link.href;a.textContent=link.href;p.append(a)})};
 target.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>action(async()=>{const m=members.docs.find(m=>m.id===b.dataset.remove);await runTransaction(db,async tx=>{tx.delete(doc(db,'families',id,'members',m.id));tx.delete(doc(db,'familyInvites',m.data().invitationId))});await show(id)}));
 }
 if(canEdit){
 target.querySelector('#shared-task').onsubmit=e=>{e.preventDefault();const values=Object.fromEntries(new FormData(e.target));action(async()=>{await setDoc(doc(db,'families',id,'tasks',crypto.randomUUID()),{title:values.title.trim(),due:values.due,done:false});await show(id)})};
 target.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=()=>action(async()=>{const t=tasks.docs.find(t=>t.id===b.dataset.toggle);await setDoc(doc(db,'families',id,'tasks',t.id),{...t.data(),done:!t.data().done});await show(id)}));
 }
 }
 content.querySelector('select').onchange=e=>action(()=>show(e.target.value));await show(links.docs[0].id);
 }catch(e){message.textContent=e.message;content.innerHTML='<button class="primary" id="retry-family">Retry connection</button>';content.querySelector('button').onclick=()=>mountFamily(root,user)}
}
