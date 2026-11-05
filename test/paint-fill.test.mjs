import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fillPixels } from '../src/scripts/paint-fill.ts';
const pixels = rows => new Uint8ClampedArray(rows.flat().flatMap(v => [v,v,v,255]));
const red = [255,0,0,255];
test('Paint fill respects a closed boundary and does not cross to disconnected regions', () => {
  const data=pixels([[0,0,0,0,0],[0,255,255,0,255],[0,0,0,0,0]]);
  fillPixels(data,5,3,1,1,red);
  assert.deepEqual([...data.slice(24,32)],[...red,...red]);
  assert.deepEqual([...data.slice(36,40)],[255,255,255,255]);
  assert.deepEqual([...data.slice(0,4)],[0,0,0,255]);
});
test('Paint fill does not wrap rows or change pixels for out-of-bounds and same-color fills', () => {
  const data=pixels([[0,0,255],[255,0,0]]);
  fillPixels(data,3,2,2,0,red);
  assert.deepEqual([...data.slice(12,16)],[255,255,255,255]);
  const before=data.slice();
  fillPixels(data,3,2,2,0,red);
  fillPixels(data,3,2,-1,0,red);
  assert.deepEqual(data,before);
});
