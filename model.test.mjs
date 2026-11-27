import test from 'node:test';import assert from 'node:assert/strict';import {emptyData,escapeHTML,dueItems,report} from './model.js';
test('New users have empty independent workspaces',()=>{const a=emptyData(),b=emptyData();a.tasks.push({title:'Private'});assert.equal(b.tasks.length,0)});
test('User text is escaped',()=>assert.equal(escapeHTML('<img onerror="x">'), '&lt;img onerror=&quot;x&quot;&gt;'));
test('Reports exclude paid bills and completed tasks',()=>assert.deepEqual(report({tasks:[{done:true},{done:false}],bills:[{paid:true,amount:500},{paid:false,amount:200}]}),{done:1,open:1,paid:1,unpaid:200}));
test('Reminders include overdue and upcoming items, exclude completed ones',()=>{const d=emptyData();d.tasks=[{id:'1',title:'Overdue',due:'2026-11-01',done:false},{id:'2',title:'Complete',due:'2026-11-27',done:true},{id:'3',title:'Future',due:'2027-01-01',done:false}];assert.deepEqual(dueItems(d,'2026-11-27').map(x=>x.id),['1'])});
