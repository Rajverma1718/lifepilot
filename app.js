const SESSION_KEY = 'lifepilot-session';
const USERS_KEY = 'lifepilot-users';
const defaultUsers = [{name:'Raj Verma',email:'raj@example.com',password:'raj123',role:'official'}];
function users(){ return JSON.parse(localStorage.getItem(USERS_KEY) || 'null') || defaultUsers; }
function authScreen(){ app.innerHTML = '<div class="auth-wrap"><div class="auth-card"><div class="logo">LP</div><h1>LifePilot</h1><p>Personal life operations platform</p><div class="auth-tabs"><button id="loginTab" class="active">Login</button><button id="signupTab">Sign up</button></div><form id="authForm"><label>Email<input name="email" type="email" required placeholder="you@example.com"></label><label>Password<input name="password" type="password" required placeholder="Minimum 6 characters"></label><label id="nameField" class="hidden">Full name<input name="name" placeholder="Your full name"></label><button class="primary" type="submit">Continue</button><div id="authMsg" class="auth-msg"></div></form><small>Official demo account: raj@example.com / raj123</small></div></div>'; let signup=false; const nameField=document.querySelector('#nameField'); const form=document.querySelector('#authForm'); document.querySelector('#loginTab').onclick=()=>{signup=false;nameField.classList.add('hidden')}; document.querySelector('#signupTab').onclick=()=>{signup=true;nameField.classList.remove('hidden')}; form.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(form));let list=users();if(signup){if(!d.name||d.password.length<6)return document.querySelector('#authMsg').textContent='Enter your name and a 6 character password.';if(list.some(x=>x.email===d.email))return document.querySelector('#authMsg').textContent='This email is already registered.';list.push({name:d.name,email:d.email,password:d.password,role:'member'});localStorage.setItem(USERS_KEY,JSON.stringify(list));localStorage.setItem(SESSION_KEY,d.email);location.reload()}else{const u=list.find(x=>x.email===d.email&&x.password===d.password);if(!u)return document.querySelector('#authMsg').textContent='Incorrect email or password.';localStorage.setItem(SESSION_KEY,u.email);location.reload()}}}
const KEY = 'lifepilot-data';
const data = JSON.parse(localStorage.getItem(KEY) || 'null') || {
  view: 'dashboard',
  tasks: [
    { id: 1, title: 'Renew vehicle insurance', category: 'Vehicle', due: '2026-12-02', done: false },
    { id: 2, title: 'Pay electricity bill', category: 'Bills', due: '2026-12-05', done: false },
    { id: 3, title: 'Complete college assignment', category: 'College', due: '2026-12-08', done: false }
  ],
  bills: [{ id: 1, name: 'Electricity bill', amount: 1450, due: '2026-12-05', paid: false }],
  documents: [{ id: 1, name: 'Driving licence', type: 'Identity', expiry: '2031-07-18' }],
  family: [{ id: 1, name: 'Neha Verma', role: 'Sister', email: 'neha@example.com' }]
};
const app = document.querySelector('#app');
const safe = value => String(value).replace(/[&<>"]/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[x]));
const save = () => localStorage.setItem(KEY, JSON.stringify(data));
const navItems = [['dashboard','Dashboard'],['tasks','Tasks'],['bills','Bills and subscriptions'],['documents','Documents'],['family','Family space'],['reports','Reports']];
function taskCard(t) { return '<div class="item"><div><h3>'+safe(t.title)+'</h3><div class="meta"><span class="pill">'+safe(t.category)+'</span>Due '+safe(t.due)+'</div></div><button class="ghost" data-task="'+t.id+'">'+(t.done?'Reopen':'Done')+'</button></div>'; }
function page() {
  if (data.view === 'dashboard') {
    const open = data.tasks.filter(x => !x.done);
    return '<section class="grid"><div class="stat"><label>Open tasks</label><b>'+open.length+'</b><div class="hint">Daily responsibilities</div></div><div class="stat"><label>Unpaid bills</label><b>Rs '+data.bills.filter(x=>!x.paid).reduce((a,x)=>a+x.amount,0)+'</b><div class="hint">Needs attention</div></div><div class="stat"><label>Documents</label><b>'+data.documents.length+'</b><div class="hint">Expiry tracking</div></div><div class="stat"><label>Family members</label><b>'+data.family.length+'</b><div class="hint">Trusted circle</div></div></section><section class="layout"><div class="panel"><div class="section-title"><h2>Today focus</h2><button class="primary" data-add="task">Add task</button></div><div class="list">'+open.map(taskCard).join('')+'</div></div><div class="panel"><h2>LifePilot insight</h2><div class="call"><span class="pill">Smart suggestion</span><p>Keep bills, documents, health tasks and family responsibilities in one organised place.</p></div></div></section>';
  }
  if (data.view === 'tasks') return '<section class="panel"><div class="section-title"><h2>All responsibilities</h2><button class="primary" data-add="task">Add task</button></div><div class="list">'+data.tasks.map(taskCard).join('')+'</div></section>';
  if (data.view === 'bills') return '<section class="panel"><div class="section-title"><h2>Recurring money commitments</h2><button class="primary" data-add="bill">Add bill</button></div><div class="list">'+data.bills.map(x=>'<div class="item"><div><h3>'+safe(x.name)+'</h3><div class="meta">Rs '+x.amount+' | Due '+x.due+'</div></div><button class="ghost" data-bill="'+x.id+'">'+(x.paid?'Undo':'Mark paid')+'</button></div>').join('')+'</div></section>';
  if (data.view === 'documents') return '<section class="panel"><div class="section-title"><h2>Important documents</h2><button class="primary" data-add="document">Add document</button></div><div class="list">'+data.documents.map(x=>'<div class="item"><div><h3>'+safe(x.name)+'</h3><div class="meta"><span class="pill">'+safe(x.type)+'</span>Expires '+safe(x.expiry)+'</div></div><span class="pill danger">Track</span></div>').join('')+'</div></section>';
  if (data.view === 'family') return '<section class="panel"><div class="section-title"><h2>Trusted circle</h2><button class="primary" data-add="family">Add person</button></div><div class="list">'+data.family.map(x=>'<div class="item"><div><h3>'+safe(x.name)+'</h3><div class="meta">'+safe(x.role)+' | '+safe(x.email)+'</div></div><span class="pill">Connected</span></div>').join('')+'</div></section>';
  return '<section class="grid"><div class="stat"><label>Tasks completed</label><b>'+data.tasks.filter(x=>x.done).length+'</b></div><div class="stat"><label>Tracked bills</label><b>'+data.bills.length+'</b></div></section><section class="panel" style="margin-top:18px"><h2>Privacy first</h2><p>This first release stores data locally in the browser. Firebase sync, file encryption and notifications are planned production features.</p></section>';
}
function render() {
  const title = {dashboard:'Good morning, Raj',tasks:'Your tasks',bills:'Bills and subscriptions',documents:'Documents and expiries',family:'Family space',reports:'Life reports'}[data.view];
  const nav = navItems.map(x=>'<button class="'+(data.view===x[0]?'active':'')+'" data-view="'+x[0]+'">'+x[1]+'</button>').join('');
  app.innerHTML = '<div class="shell"><aside class="side"><div class="brand"><div class="logo">LP</div><div><strong>LifePilot</strong><small>Life, organised</small></div></div><nav class="nav">'+nav+'</nav></aside><main class="main"><header class="top"><div><h1>'+title+'</h1><p>Your personal life operations dashboard.</p></div><div class="avatar">RV</div></header>'+page()+'</main></div><div id="modal"></div>';
  document.querySelectorAll('[data-view]').forEach(x=>x.onclick=()=>{data.view=x.dataset.view;save();render()});
  document.querySelectorAll('[data-task]').forEach(x=>x.onclick=()=>{const t=data.tasks.find(y=>y.id==x.dataset.task);t.done=!t.done;save();render()});
  document.querySelectorAll('[data-bill]').forEach(x=>x.onclick=()=>{const b=data.bills.find(y=>y.id==x.dataset.bill);b.paid=!b.paid;save();render()});
  document.querySelectorAll('[data-add]').forEach(x=>x.onclick=()=>add(x.dataset.add));
}
function add(type) {
  const name = prompt(type === 'task' ? 'Task name' : type === 'bill' ? 'Bill name' : type === 'document' ? 'Document name' : 'Person name');
  if (!name) return;
  if (type === 'task') data.tasks.push({id:Date.now(),title:name,category:'Personal',due:'2026-12-31',done:false});
  if (type === 'bill') data.bills.push({id:Date.now(),name:name,amount:0,due:'2026-12-31',paid:false});
  if (type === 'document') data.documents.push({id:Date.now(),name:name,type:'Personal',expiry:'2026-12-31'});
  if (type === 'family') data.family.push({id:Date.now(),name:name,role:'Trusted person',email:'pending'});
  save(); render();
}
if(localStorage.getItem(SESSION_KEY)){render()}else{authScreen()}

