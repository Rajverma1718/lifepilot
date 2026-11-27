export const emptyData=()=>({tasks:[],bills:[],documents:[]});
export function csvReport(data){
 const cents=bill=>Math.round(Number(bill.amount||0)*100);
 const paid=data.bills.filter(b=>b.paid),unpaid=data.bills.filter(b=>!b.paid);
 const sum=bills=>(bills.reduce((total,bill)=>total+cents(bill),0)/100).toFixed(2);
 const rows=[['Type','Name','Date','Status','Amount (INR)'],
 ...data.tasks.map(t=>['Task',t.title,t.due,t.done?'Done':'Open','']),
 ...data.bills.map(b=>['Bill',b.name,b.due,b.paid?'Paid':'Unpaid',(cents(b)/100).toFixed(2)]),
 [],['Summary','Count','Amount (INR)'],
 ['Total bills',data.bills.length,sum(data.bills)],
 ['Paid bills',paid.length,sum(paid)],
 ['Unpaid bills',unpaid.length,sum(unpaid)]];
 return '\uFEFF'+rows.map(row=>row.map(value=>'"'+String(value??'').replace(/"/g,'""').replace(/^[=+@-]/,"'$&")+'"').join(',')).join('\r\n');
}
export function nextDue(date,frequency){const [year,month,day]=date.split('-').map(Number);const target=new Date(Date.UTC(year,month-1+(frequency==='Monthly'?1:0),1));if(frequency==='Yearly')target.setUTCFullYear(year+1);const max=new Date(Date.UTC(target.getUTCFullYear(),target.getUTCMonth()+1,0)).getUTCDate();target.setUTCDate(Math.min(day,max));return target.toISOString().slice(0,10)}
export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function report(data){return {done:data.tasks.filter(x=>x.done).length,open:data.tasks.filter(x=>!x.done).length,paid:data.bills.filter(x=>x.paid).length,unpaid:data.bills.filter(x=>!x.paid).reduce((sum,x)=>sum+Number(x.amount||0),0)}}
export function dueItems(data,today=new Date().toLocaleDateString('en-CA')){const end=new Date(today+'T12:00:00');end.setDate(end.getDate()+7);const limit=end.toLocaleDateString('en-CA');return [...data.tasks.filter(x=>!x.done).map(x=>({id:x.id,title:x.title,date:x.due})),...data.bills.filter(x=>!x.paid).map(x=>({id:x.id,title:x.name,date:x.due})),...data.documents.map(x=>({id:x.id,title:x.name,date:x.expiry}))].filter(x=>x.date&&x.date<=limit).sort((a,b)=>a.date.localeCompare(b.date))}
