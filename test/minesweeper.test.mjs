import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Minesweeper } from '../src/scripts/minesweeper.ts';
test('first click and its neighbors are safe and zero cells expand',()=>{
 for(const first of [0,40,80]){const game=new Minesweeper();game.reveal(first,()=>0.35);assert.equal(game.mines.size,10);assert.ok(!game.mines.has(first));assert.equal(game.adjacent(first),0);assert.ok(game.revealed.size>1);assert.ok([...game.revealed].every(i=>!game.mines.has(i)));}
});
test('flags block reveal and are limited to the mine count',()=>{
 const game=new Minesweeper();game.flag(0);game.reveal(0);assert.equal(game.state,'ready');game.flag(0);assert.equal(game.flags.size,0);
 for(let i=0;i<20;i++)game.flag(i);assert.equal(game.flags.size,10);
});
test('mine click loses and completed safe board wins; finished games are immutable',()=>{
 const loss=new Minesweeper();loss.mines=new Set([0,8,20,24,30,50,56,60,72,80]);loss.state='playing';loss.reveal(0);assert.equal(loss.state,'lost');const size=loss.revealed.size;loss.reveal(80);assert.equal(loss.revealed.size,size);
 const win=new Minesweeper();win.reveal(40,()=>0.4);for(let i=0;i<81;i++)if(!win.mines.has(i))win.reveal(i);
 assert.equal(win.state,'won');assert.equal(win.flags.size,10);win.flag([...win.mines][0]);assert.equal(win.flags.size,10);
});
test('neighbors do not wrap across the board edges',()=>{const game=new Minesweeper();assert.deepEqual(game.neighbors(0),[1,9,10]);assert.equal(game.neighbors(40).length,8);assert.deepEqual(game.neighbors(80),[70,71,79]);});
