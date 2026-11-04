import assert from 'node:assert/strict';
import { test } from 'node:test';
import { terminalKeys } from '../src/scripts/terminal-keys.ts';
function setup(value) {
 const input={value,selectionStart:value.length,selectionEnd:value.length,setSelectionRange(a,b){this.selectionStart=a;this.selectionEnd=b;},setRangeText(text,a,b,mode){this.value=this.value.slice(0,a)+text+this.value.slice(b);this.setSelectionRange(mode==='end'?a+text.length:a,mode==='end'?a+text.length:a);}};
 const calls=[];
 globalThis.window={getSelection:()=>null};
 const handler=terminalKeys(input,{clear:()=>calls.push('clear'),interrupt:()=>calls.push('interrupt'),history:d=>calls.push(d)});
 return {input,calls,press(key,extra={}){let prevented=false;handler({key,ctrlKey:true,preventDefault(){prevented=true;},...extra});return prevented;}};
}
test('clear preserves the draft, cancellation and history use their actions',()=>{
 const s=setup('ls projects');s.press('l');assert.equal(s.input.value,'ls projects');
 s.press('c');s.press('p');s.press('n');assert.deepEqual(s.calls,['clear','interrupt',-1,1]);
});
test('cursor editing, kill and yank work at the caret and with selections',()=>{
 const s=setup('ls projects');s.press('w');assert.equal(s.input.value,'ls ');s.press('y');assert.equal(s.input.value,'ls projects');
 s.press('a');s.press('f');assert.equal(s.input.selectionStart,1);s.press('d');assert.equal(s.input.value,'l projects');
 s.press('k');assert.equal(s.input.value,'l');s.press('y');assert.equal(s.input.value,'l projects');
 s.press('e');s.press('b');s.press('u');assert.equal(s.input.value,'s');s.press('y');assert.equal(s.input.value,'l projects');
 s.input.setSelectionRange(0,2);s.press('h');assert.equal(s.input.value,'projects');
});
test('copy selections, native shortcuts and composition are not intercepted',()=>{
 const s=setup('draft');s.input.setSelectionRange(0,5);assert.equal(s.press('c'),false);
 assert.equal(s.press('v'),false);assert.equal(s.press('l',{metaKey:true}),false);
 assert.equal(s.press('l',{isComposing:true}),false);assert.equal(s.press('l',{ctrlKey:false}),false);
 assert.deepEqual(s.calls,[]);
});
