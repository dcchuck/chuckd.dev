import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('window.setTheme'));
function boot(search, saved, blocked=false) {
 const root={ dataset:{} }; const events=[]; const picker={value:''}; let stored=saved; let colorMode; let replaced;
 const context={URL, URLSearchParams, location:{search,href:`https://chuckd.dev/${search}`},history:{replaceState:(_a,_b,url)=>{replaced=String(url);}},document:{documentElement:root,querySelectorAll:()=>[picker]},localStorage:{getItem:(key)=>{if(blocked)throw Error();return key==='theme'?stored:colorMode;},setItem:(key,v)=>{if(blocked)throw Error();if(key==='theme')stored=v;else colorMode=v;}},CustomEvent:class {constructor(type,options){this.type=type;this.detail=options.detail;}},window:{dispatchEvent:e=>events.push(e)}};
 runInNewContext(script,context);
 return {root,events,picker,context,get stored(){return stored;},get replaced(){return replaced;}};
}
test('URL theme overrides saved selection and switching updates the share URL',()=>{
 const state=boot('?theme=terminal','windows-classic');
 assert.equal(state.root.dataset.theme,'terminal');
 state.context.window.setTheme('windows-classic');
 assert.equal(state.stored,'windows-classic');assert.equal(state.picker.value,'windows-classic');
 assert.equal(state.replaced,'https://chuckd.dev/?theme=windows-classic');assert.equal(state.events.at(-1).detail.theme,'windows-classic');
});
test('legacy and invalid preferences fall back safely, including blocked storage',()=>{
 for(const saved of ['bad',null]) assert.equal(boot('?theme=bad',saved).root.dataset.theme,'default');
 for(const saved of ['dark','light']) { const state=boot('',saved); assert.equal(state.root.dataset.theme,'goonies'); assert.equal(state.root.dataset.mode,saved); }
 assert.equal(boot('', 'terminal').root.dataset.theme,'terminal');
 const state=boot('?theme=windows-classic',null,true);assert.equal(state.root.dataset.theme,'windows-classic');
 assert.equal(state.context.window.setTheme('invalid'),false);assert.equal(state.root.dataset.theme,'windows-classic');
});

test('plain default and Goonies retain independent black/white mode across skin changes',()=>{
 const state=boot('',null);assert.equal(state.root.dataset.theme,'default');
 state.context.window.setColorMode('light');state.context.window.setTheme('terminal');
 state.context.window.setTheme('goonies');assert.equal(state.root.dataset.mode,'light');
 state.context.window.setColorMode('dark');state.context.window.setTheme('default');assert.equal(state.root.dataset.mode,'dark');
});
