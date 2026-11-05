/**
 * Original bitmap fonts for the Windows Classic theme, compiled to WOFF2.
 *
 * Each glyph is hand-drawn on the pixel grid of an 8pt 96-DPI system font. One font pixel is
 * exactly 100 units, so at the intended CSS size a glyph pixel lands on a whole CSS pixel and
 * stays crisp on any display. No hinting or external tooling is involved.
 */
import { brotliCompressSync, constants as z } from 'node:zlib';

/** Glyphs as [rows below cap-top, rows]. The baseline sits under row 7 of a cap-height glyph. */
const SANS = {
  A: [0, '...#...|...#...|..#.#..|..#.#..|.#...#.|.#####.|#.....#|#.....#'],
  B: [0, '#####.|#....#|#....#|#####.|#....#|#....#|#....#|#####.'],
  C: [0, '..###.|.#...#|#.....|#.....|#.....|#.....|.#...#|..###.'],
  D: [0, '#####..|#....#.|#.....#|#.....#|#.....#|#.....#|#....#.|#####..'],
  E: [0, '#####|#....|#....|####.|#....|#....|#....|#####'],
  F: [0, '#####|#....|#....|####.|#....|#....|#....|#....'],
  G: [0, '..####.|.#....#|#......|#......|#...###|#.....#|.#....#|..####.'],
  H: [0, '#....#|#....#|#....#|######|#....#|#....#|#....#|#....#'],
  I: [0, '###|.#.|.#.|.#.|.#.|.#.|.#.|###'],
  J: [0, '...#|...#|...#|...#|...#|...#|#..#|.##.'],
  K: [0, '#...#.|#..#..|#.#...|##....|##....|#.#...|#..#..|#...#.'],
  L: [0, '#....|#....|#....|#....|#....|#....|#....|#####'],
  M: [0, '##...##|##...##|#.#.#.#|#.#.#.#|#..#..#|#..#..#|#.....#|#.....#'],
  N: [0, '##...#|##...#|#.#..#|#.#..#|#..#.#|#..#.#|#...##|#...##'],
  O: [0, '..###..|.#...#.|#.....#|#.....#|#.....#|#.....#|.#...#.|..###..'],
  P: [0, '####.|#...#|#...#|#...#|####.|#....|#....|#....'],
  Q: [0, '..###..|.#...#.|#.....#|#.....#|#.....#|#.....#|.#...#.|..###..|....#..|.....##'],
  R: [0, '####..|#...#.|#...#.|#...#.|####..|#..#..|#...#.|#....#'],
  S: [0, '.####.|#....#|#.....|.##...|...##.|.....#|#....#|.####.'],
  T: [0, '#######|...#...|...#...|...#...|...#...|...#...|...#...|...#...'],
  U: [0, '#....#|#....#|#....#|#....#|#....#|#....#|#....#|.####.'],
  V: [0, '#.....#|#.....#|.#...#.|.#...#.|.#...#.|..#.#..|..#.#..|...#...'],
  W: [0, '#...#...#|#...#...#|#...#...#|.#.#.#.#.|.#.#.#.#.|.#.#.#.#.|..#...#..|..#...#..'],
  X: [0, '#....#|#....#|.#..#.|..##..|..##..|.#..#.|#....#|#....#'],
  Y: [0, '#.....#|.#...#.|.#...#.|..#.#..|...#...|...#...|...#...|...#...'],
  Z: [0, '######|.....#|....#.|...#..|..#...|.#....|#.....|######'],
  a: [2, '.###.|....#|.####|#...#|#...#|.####'],
  b: [0, '#....|#....|####.|#...#|#...#|#...#|#...#|####.'],
  c: [2, '.###|#...|#...|#...|#...|.###'],
  d: [0, '....#|....#|.####|#...#|#...#|#...#|#...#|.####'],
  e: [2, '.###.|#...#|#####|#....|#...#|.###.'],
  f: [0, '.##|#..|###|#..|#..|#..|#..|#..'],
  g: [2, '.####|#...#|#...#|#...#|#...#|.####|....#|.###.'],
  h: [0, '#....|#....|####.|#...#|#...#|#...#|#...#|#...#'],
  i: [0, '#|.|#|#|#|#|#|#'],
  j: [0, '.#|..|.#|.#|.#|.#|.#|.#|.#|#.'],
  k: [0, '#....|#....|#..#.|#.#..|##...|#.#..|#..#.|#...#'],
  l: [0, '#|#|#|#|#|#|#|#'],
  m: [2, '###.##.|#..#..#|#..#..#|#..#..#|#..#..#|#..#..#'],
  n: [2, '####.|#...#|#...#|#...#|#...#|#...#'],
  o: [2, '.###.|#...#|#...#|#...#|#...#|.###.'],
  p: [2, '####.|#...#|#...#|#...#|#...#|####.|#....|#....'],
  q: [2, '.####|#...#|#...#|#...#|#...#|.####|....#|....#'],
  r: [2, '#.#|##.|#..|#..|#..|#..'],
  s: [2, '.###|#...|##..|..##|...#|###.'],
  t: [1, '#..|###|#..|#..|#..|#..|.##'],
  u: [2, '#...#|#...#|#...#|#...#|#...#|.####'],
  v: [2, '#...#|#...#|.#.#.|.#.#.|..#..|..#..'],
  w: [2, '#..#..#|#..#..#|#.#.#.#|#.#.#.#|.#...#.|.#...#.'],
  x: [2, '#...#|.#.#.|..#..|..#..|.#.#.|#...#'],
  y: [2, '#...#|#...#|.#.#.|.#.#.|..#..|..#..|.#...|.#...'],
  z: [2, '####|...#|..#.|.#..|#...|####'],
  0: [0, '.###.|#...#|#...#|#...#|#...#|#...#|#...#|.###.'],
  1: [0, '..#..|.##..|..#..|..#..|..#..|..#..|..#..|.###.'],
  2: [0, '.###.|#...#|....#|...#.|..#..|.#...|#....|#####'],
  3: [0, '.###.|#...#|....#|..##.|....#|....#|#...#|.###.'],
  4: [0, '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.|...#.'],
  5: [0, '#####|#....|#....|####.|....#|....#|#...#|.###.'],
  6: [0, '..##.|.#...|#....|####.|#...#|#...#|#...#|.###.'],
  7: [0, '#####|....#|...#.|...#.|..#..|..#..|.#...|.#...'],
  8: [0, '.###.|#...#|#...#|.###.|#...#|#...#|#...#|.###.'],
  9: [0, '.###.|#...#|#...#|#...#|.####|....#|...#.|.##..'],
  '!': [0, '#|#|#|#|#|#|.|#'],
  '"': [0, '#.#|#.#'],
  '#': [0, '...#.#.|...#.#.|.#####.|..#.#..|..#.#..|.#####.|.#.#...|.#.#...'],
  $: [-1, '..#..|.####|#.#..|#.#..|.###.|..#.#|..#.#|####.|..#..'],
  '%': [0, '.##...#.|#..#..#.|#..#.#..|.##.#...|...#.##.|..#.#..#|.#..#..#|.#...##.'],
  '&': [0, '.##....|#..#...|#..#...|.##....|#..#.#.|#...#..|#...#..|.###.##'],
  "'": [0, '#|#'],
  '(': [0, '..#|.#.|.#.|#..|#..|#..|#..|.#.|.#.|..#'],
  ')': [0, '#..|.#.|.#.|..#|..#|..#|..#|.#.|.#.|#..'],
  '*': [0, '..#..|#.#.#|.###.|#.#.#|..#..'],
  '+': [1, '...#...|...#...|...#...|#######|...#...|...#...|...#...'],
  ',': [7, '.#|.#|#.'],
  '-': [4, '###'],
  '.': [7, '#'],
  '/': [0, '...#|...#|..#.|..#.|.#..|.#..|#...|#...'],
  ':': [2, '#|.|.|.|.|#'],
  ';': [2, '.#|..|..|..|..|.#|.#|#.'],
  '<': [1, '.....#|...##.|.##...|#.....|.##...|...##.|.....#'],
  '=': [3, '######|......|######'],
  '>': [1, '#.....|.##...|...##.|.....#|...##.|.##...|#.....'],
  '?': [0, '.##.|#..#|...#|..#.|.#..|.#..|....|.#..'],
  '@': [0, '...####..|.##....#.|.#..###.#|#..#..#.#|#..#..#.#|#..#..#.#|.#..####.|.##......|...####..'],
  '[': [0, '##|#.|#.|#.|#.|#.|#.|#.|#.|##'],
  '\\': [0, '#...|#...|.#..|.#..|..#.|..#.|...#|...#'],
  ']': [0, '##|.#|.#|.#|.#|.#|.#|.#|.#|##'],
  '^': [0, '..#..|.#.#.|#...#'],
  _: [9, '######'],
  '`': [0, '#.|.#'],
  '{': [0, '..##|.#..|.#..|.#..|#...|.#..|.#..|.#..|.#..|..##'],
  '|': [0, '#|#|#|#|#|#|#|#|#|#'],
  '}': [0, '##..|..#.|..#.|..#.|...#|..#.|..#.|..#.|..#.|##..'],
  '~': [3, '.##..#|#..##.'],
  '…': [7, '#.#.#'],
  '–': [4, '#####'],
  '—': [4, '#########'],
  '×': [2, '#...#|.#.#.|..#..|.#.#.|#...#'],
  '•': [3, '.#.|###|.#.'],
  '‘': [0, '.#|#.'],
  '’': [0, '.#|#.'],
  '“': [0, '.#.#|#.#.'],
  '”': [0, '.#.#|#.#.'],
};

/** Terminal cell overrides: wide letters narrowed so doubled strokes fit, thin letters given serifs. */
const MONO_OVERRIDES = {
  A: [0, '..##..|.#..#.|#....#|#....#|######|#....#|#....#|#....#'],
  D: [0, '#####.|#....#|#....#|#....#|#....#|#....#|#....#|#####.'],
  G: [0, '.####.|#....#|#.....|#.....|#..###|#....#|#....#|.####.'],
  O: [0, '.####.|#....#|#....#|#....#|#....#|#....#|#....#|.####.'],
  Q: [0, '.####.|#....#|#....#|#....#|#....#|#....#|#..#.#|.####.|.....#'],
  T: [0, '######|..#...|..#...|..#...|..#...|..#...|..#...|..#...'],
  V: [0, '#....#|#....#|#....#|#....#|.#..#.|.#..#.|..##..|..##..'],
  Y: [0, '#....#|#....#|.#..#.|..##..|..#...|..#...|..#...|..#...'],
  '+': [1, '..#...|..#...|..#...|######|..#...|..#...|..#...'],
  '&': [0, '.##...|#..#..|#..#..|.##...|#..#.#|#...#.|#...#.|.###.#'],
  W: [0, '#.....#|#.....#|#.....#|#..#..#|#..#..#|#..#..#|.##.##.|.#...#.'],
  i: [0, '..#..|.....|.##..|..#..|..#..|..#..|..#..|.###.'],
  l: [0, '.##..|..#..|..#..|..#..|..#..|..#..|..#..|.###.'],
  j: [0, '...#.|.....|..##.|...#.|...#.|...#.|...#.|...#.|#..#.|.##..'],
  r: [2, '#.##.|##..#|#....|#....|#....|#....'],
  f: [0, '..##.|.#..#|.#...|###..|.#...|.#...|.#...|.#...'],
  t: [1, '.#...|####.|.#...|.#...|.#...|.#..#|..##.'],
  '%': [0, '.#...#.|#.#..#.|.#..#..|...#...|...#...|..#..#.|.#..#.#|.#...#.'],
  '@': [0, '.####..|#....#.|#.##.#.|#.#.##.|#.#.##.|#.###..|#......|.####..'],
  '—': [4, '#######'],
};

/** Glyphs whose one-pixel gaps would close up if their strokes were simply doubled. */
const BOLD_OVERRIDES = {
  '…': [7, '##.##.##'],
  '"': [0, '##.##|##.##'],
  '“': [0, '.#.#.|#.#..'],
  '”': [0, '.#.#.|#.#..'],
};

const parse = ([top, art]) => ({ top, rows: art.split('|').map(row => [...row].map(c => c === '#')) });
const widthOf = glyph => Math.max(...glyph.rows.map(row => row.length));

/** Widen vertical strokes by one pixel, as bold system bitmap fonts do at this size. */
function embolden(glyph) {
  const width = widthOf(glyph) + 1;
  return { top: glyph.top, rows: glyph.rows.map(row => Array.from({ length: width }, (_, x) => Boolean(row[x] || row[x - 1]))) };
}

/** Center a glyph in a fixed terminal cell. */
function fitCell(glyph, cell) {
  const offset = Math.floor((cell - widthOf(glyph)) / 2);
  return { top: glyph.top, rows: glyph.rows.map(row => Array.from({ length: cell }, (_, x) => Boolean(row[x - offset]))) };
}

const PIXEL = 100;
const BASELINE_ROW = 8;

/** Rows of pixels become non-overlapping rectangles, merged vertically where runs line up. */
function rectangles({ top, rows }) {
  const done = [];
  let open = [];
  rows.forEach((row, index) => {
    const runs = [];
    for (let x = 0; x < row.length; x++) {
      if (!row[x]) continue;
      let end = x;
      while (row[end + 1]) end++;
      runs.push([x, end + 1]);
      x = end;
    }
    const next = [];
    for (const run of runs) {
      const match = open.find(rect => rect.x0 === run[0] && rect.x1 === run[1] && rect.y1 === index);
      if (match) { match.y1 = index + 1; next.push(match); } else next.push({ x0: run[0], x1: run[1], y0: index, y1: index + 1 });
    }
    done.push(...open.filter(rect => !next.includes(rect)));
    open = next;
  });
  done.push(...open);
  return done.map(rect => ({
    x0: rect.x0 * PIXEL,
    x1: rect.x1 * PIXEL,
    y0: (BASELINE_ROW - (top + rect.y1)) * PIXEL,
    y1: (BASELINE_ROW - (top + rect.y0)) * PIXEL,
  }));
}

function outline(rects) {
  if (!rects.length) return Buffer.alloc(0);
  const count = rects.length;
  const out = Buffer.alloc(10 + count * 2 + 2 + count * 4 + count * 8 + count * 8);
  let at = 0;
  out.writeInt16BE(count, 0);
  out.writeInt16BE(Math.min(...rects.map(r => r.x0)), 2);
  out.writeInt16BE(Math.min(...rects.map(r => r.y0)), 4);
  out.writeInt16BE(Math.max(...rects.map(r => r.x1)), 6);
  out.writeInt16BE(Math.max(...rects.map(r => r.y1)), 8);
  at = 10;
  rects.forEach((_, i) => { out.writeUInt16BE(i * 4 + 3, at); at += 2; });
  out.writeUInt16BE(0, at); at += 2;
  const points = rects.flatMap(r => [[r.x0, r.y0], [r.x0, r.y1], [r.x1, r.y1], [r.x1, r.y0]]);
  points.forEach(() => { out[at++] = 1; });
  let previous = 0;
  for (const [x] of points) { out.writeInt16BE(x - previous, at); at += 2; previous = x; }
  previous = 0;
  for (const [, y] of points) { out.writeInt16BE(y - previous, at); at += 2; previous = y; }
  return out.subarray(0, at);
}

const u16 = (...values) => { const b = Buffer.alloc(values.length * 2); values.forEach((v, i) => b.writeUInt16BE(v & 0xffff, i * 2)); return b; };
const u32 = (...values) => { const b = Buffer.alloc(values.length * 4); values.forEach((v, i) => b.writeUInt32BE(v >>> 0, i * 4)); return b; };
const pad4 = buffer => (buffer.length % 4 ? Buffer.concat([buffer, Buffer.alloc(4 - buffer.length % 4)]) : buffer);

function cmapTable(codes) {
  const segments = [];
  codes.forEach((code, i) => {
    const last = segments.at(-1);
    if (last && last.end + 1 === code && last.glyph + (code - last.start) === i + 1) last.end = code;
    else segments.push({ start: code, end: code, glyph: i + 1 });
  });
  segments.push({ start: 0xffff, end: 0xffff, glyph: 0 });
  const n = segments.length;
  const log = Math.floor(Math.log2(n));
  const sub = Buffer.concat([
    u16(4, 16 + n * 8, 0, n * 2, 2 ** (log + 1), log, n * 2 - 2 ** (log + 1)),
    u16(...segments.map(s => s.end)), u16(0),
    u16(...segments.map(s => s.start)),
    u16(...segments.map(s => (s.start === 0xffff ? 1 : s.glyph - s.start))),
    u16(...segments.map(() => 0)),
  ]);
  return Buffer.concat([u16(0, 1, 3, 1), u32(12), sub]);
}

function nameTable(family, style) {
  const strings = [[1, family], [2, style], [3, `${family} ${style} chuckd.dev`], [4, `${family} ${style}`], [6, `${family}-${style}`.replace(/\s/g, '')]];
  const records = [];
  const data = [];
  let offset = 0;
  for (const [id, text] of strings) {
    const encoded = Buffer.from(text, 'utf16le').swap16();
    records.push(u16(3, 1, 0x409, id, encoded.length, offset));
    data.push(encoded);
    offset += encoded.length;
  }
  return Buffer.concat([u16(0, strings.length, 6 + strings.length * 12), ...records, ...data]);
}

/** Build the raw sfnt tables for a set of glyphs. `unitsPerEm` picks the crisp CSS size. */
function tables({ glyphs, family, style, unitsPerEm, bold }) {
  const codes = Object.keys(glyphs).map(c => c.codePointAt(0)).sort((a, b) => a - b);
  const notdef = { top: 0, rows: Array.from({ length: 8 }, () => Array(5).fill(true)), advance: 600 };
  const order = [notdef, ...codes.map(code => glyphs[String.fromCodePoint(code)])];
  const outlines = order.map(glyph => pad4(outline(rectangles(glyph))));
  const offsets = [0];
  outlines.forEach(o => offsets.push(offsets.at(-1) + o.length));
  const advances = order.map(g => g.advance);
  const rects = order.map(rectangles);
  const ascent = BASELINE_ROW * PIXEL + PIXEL;
  const descent = 3 * PIXEL;
  const maxRects = Math.max(...rects.map(r => r.length), 1);
  const xMax = Math.max(...rects.flat().map(r => r.x1));
  const yMax = Math.max(...rects.flat().map(r => r.y1));
  const yMin = Math.min(...rects.flat().map(r => r.y0));
  const avg = Math.round(advances.reduce((a, b) => a + b, 0) / advances.length);

  const head = Buffer.concat([u32(0x00010000, 0x00010000, 0, 0x5f0f3cf5), u16(0x000b, unitsPerEm), Buffer.alloc(16), u16(0, yMin, xMax, yMax, bold ? 1 : 0, 8, 2, 1, 0)]);
  const hhea = Buffer.concat([u32(0x00010000), u16(ascent, -descent, 0, Math.max(...advances), 0, 0, xMax, 1, 0, 0, 0, 0, 0, 0, 0, advances.length)]);
  const maxp = Buffer.concat([u32(0x00010000), u16(order.length, maxRects * 4, maxRects, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0)]);
  const os2 = Buffer.concat([
    u16(3, avg, bold ? 700 : 400, 5, 0, 700, 650, 0, 140, 700, 650, 0, 480, 50, 250, 0),
    Buffer.alloc(10), u32(1, 0, 0, 0), Buffer.from('CHKD'),
    u16(bold ? 0x20 : 0x40, codes[0], codes.at(-1), ascent, -descent, 0, ascent, descent),
    u32(1, 0), u16(6 * PIXEL, 8 * PIXEL, 0, 32, 1),
  ]);
  const hmtx = Buffer.concat(order.map((glyph, i) => u16(glyph.advance, rects[i].length ? Math.min(...rects[i].map(r => r.x0)) : 0)));
  const post = Buffer.concat([u32(0x00030000), Buffer.alloc(28)]);
  return {
    cmap: cmapTable(codes), head, hhea, hmtx, maxp, name: nameTable(family, style), 'OS/2': os2, post,
    glyf: Buffer.concat(outlines), loca: u32(...offsets),
  };
}

function uintBase128(value) {
  const bytes = [];
  for (let shift = 28; shift >= 0; shift -= 7) {
    const part = (value >>> shift) & 0x7f;
    if (part || bytes.length || shift === 0) bytes.push(part | (shift ? 0x80 : 0));
  }
  return Buffer.from(bytes);
}

/** Wrap tables as WOFF2, leaving glyf/loca untransformed (a transform version the format allows). */
function woff2(sfnt) {
  const known = ['cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm', 'glyf', 'loca'];
  const names = ['cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'glyf', 'loca'];
  const directory = Buffer.concat(names.map(tag => {
    const index = known.indexOf(tag);
    const nullTransform = tag === 'glyf' || tag === 'loca' ? 0xc0 : 0;
    return Buffer.concat([Buffer.from([index | nullTransform]), uintBase128(sfnt[tag].length)]);
  }));
  const raw = Buffer.concat(names.map(tag => sfnt[tag]));
  const compressed = brotliCompressSync(raw, {
    params: { [z.BROTLI_PARAM_MODE]: z.BROTLI_MODE_FONT, [z.BROTLI_PARAM_QUALITY]: 11, [z.BROTLI_PARAM_SIZE_HINT]: raw.length },
  });
  const totalSfnt = 12 + names.length * 16 + names.reduce((sum, tag) => sum + pad4(sfnt[tag]).length, 0);
  // Decoders expect the file to end on a 4-byte boundary; the pad sits outside the compressed length.
  const body = pad4(Buffer.concat([Buffer.alloc(48), directory, compressed]));
  const header = Buffer.concat([
    Buffer.from('wOF2'), u32(0x00010000, body.length), u16(names.length, 0),
    u32(totalSfnt, compressed.length), u16(1, 0), u32(0, 0, 0, 0, 0),
  ]);
  header.copy(body);
  return body;
}

function withAdvance(glyph, gap = 1) {
  return { ...glyph, advance: (widthOf(glyph) + gap) * PIXEL };
}

export function buildFonts() {
  const base = Object.fromEntries(Object.entries(SANS).map(([char, glyph]) => [char, parse(glyph)]));
  const space = { top: 0, rows: [] };
  const regular = { ' ': { ...space, advance: 3 * PIXEL } };
  const heavy = { ' ': { ...space, advance: 3 * PIXEL } };
  const mono = { ' ': { ...space, advance: 8 * PIXEL } };
  for (const [char, glyph] of Object.entries(base)) {
    regular[char] = withAdvance(glyph);
    heavy[char] = withAdvance(BOLD_OVERRIDES[char] ? parse(BOLD_OVERRIDES[char]) : embolden(glyph));
    const cell = MONO_OVERRIDES[char] ? parse(MONO_OVERRIDES[char]) : glyph;
    if (widthOf(cell) > 7) continue;
    // Raster terminal type has double-width strokes; letters with one-pixel counters stay single.
    const stroked = widthOf(cell) <= 6 && !'mw%@#'.includes(char) ? embolden(cell) : cell;
    mono[char] = { ...fitCell(stroked, 8), advance: 8 * PIXEL };
  }
  return {
    'classic-sans.woff2': woff2(tables({ glyphs: regular, family: 'Classic Sans', style: 'Regular', unitsPerEm: 1100, bold: false })),
    'classic-sans-bold.woff2': woff2(tables({ glyphs: heavy, family: 'Classic Sans', style: 'Bold', unitsPerEm: 1100, bold: true })),
    'classic-mono.woff2': woff2(tables({ glyphs: mono, family: 'Classic Mono', style: 'Regular', unitsPerEm: 1200, bold: false })),
  };
}
