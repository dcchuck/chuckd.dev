import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SiteShell, tokenize } from '../src/scripts/shell.ts';
const create=()=>new SiteShell({'/home/chuck/about.txt':{text:'Biography'},'/home/chuck/projects/tool.txt':{text:'A tool'},'/home/chuck/blog/post.md':{text:'# Post'}});
test('working directory, relative paths, home and previous directory are consistent',()=>{
 const s=create();assert.equal(s.execute('pwd').text,'/home/chuck');
 s.execute('cd projects');assert.equal(s.shortPath,'~/projects');assert.equal(s.execute('pwd').text,'/home/chuck/projects');
 assert.equal(s.execute('cat tool.txt').text,'A tool');assert.equal(s.execute('cat ../about.txt').text,'Biography');
 s.execute('cd ~');assert.equal(s.execute('cd -').text,'/home/chuck/projects');
 s.execute('cd /');assert.equal(s.execute('ls').text,'home/');s.execute('cd ../../');assert.equal(s.cwd,'/');
});
test('failed paths leave directory intact and report meaningful errors',()=>{
 const s=create();assert.match(s.execute('cd about.txt').text,/not a directory/);assert.equal(s.cwd,s.home);
 assert.match(s.execute('cat projects').text,/is a directory/);assert.match(s.execute('ls missing').text,/no such file/);
 assert.match(s.execute('pwdx').text,/command not found: pwdx/);assert.equal(s.execute('echo $?').text,'1');
});
test('completion follows the working directory and distinguishes directory arguments',()=>{
 const s=create();assert.deepEqual(s.complete('pw'),['pwd ']);assert.deepEqual(s.complete('cd pr'),['cd projects/']);
 s.execute('cd projects');assert.deepEqual(s.complete('cat to'),['cat tool.txt ']);
 assert.deepEqual(s.complete('cat ../ab'),['cat ../about.txt ']);assert.deepEqual(s.complete('theme win'),['theme windows-classic ']);
});
test('shell handles quoted text, listings, history and clear without resetting state',()=>{
 const s=create();assert.deepEqual(tokenize('echo "hello world" a\\ b'),['echo','hello world','a b']);
 assert.equal(s.execute('echo "Hello World"').text,'Hello World');assert.match(s.execute('echo "unfinished').text,/unterminated/);
 assert.match(s.execute('ls -la').text,/dr-xr-xr-x  chuck  projects\//);
 s.execute('cd blog');assert.equal(s.execute('clear').clear,true);assert.equal(s.cwd,s.home+'/blog');assert.match(s.execute('history').text,/cd blog/);
 assert.match(s.execute('cat post.md | more').text,/pipes and redirection/);
});
