/**
 * Original pixel artwork for the Windows Classic theme, drawn in the low-color style of the era.
 * Everything is authored on the pixel grid here and packed into one PNG sprite sheet.
 */
import { deflateSync } from 'node:zlib';

const K = '#000000', W = '#ffffff', G = '#c0c0c0', S = '#808080', F = '#d4d0c8', D = '#404040';
const N = '#000080', B = '#0000ff', LB = '#3a6ea5', C = '#00ffff', T = '#008080', SKY = '#a6caf0';
const Y = '#ffff00', O = '#808000', R = '#ff0000', M = '#800000', LG = '#00ff00', GR = '#008000', P = '#800080';
const F1 = '#fff2b3', F2 = '#ffdc73', F3 = '#f2bd3d', F4 = '#b98a1c', F5 = '#6b4f0f';

const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16), 255];

class Pixels {
  constructor(w, h) { this.w = w; this.h = h; this.data = new Uint8Array(w * h * 4); }
  p(x, y, c) { if (x < 0 || y < 0 || x >= this.w || y >= this.h) return this; this.data.set(typeof c === 'string' ? hex(c) : c, (y * this.w + x) * 4); return this; }
  r(x, y, w, h, c) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.p(i, j, c); return this; }
  box(x, y, w, h, c) { this.r(x, y, w, 1, c); this.r(x, y + h - 1, w, 1, c); this.r(x, y, 1, h, c); this.r(x + w - 1, y, 1, h, c); return this; }
  l(x0, y0, x1, y1, c) {
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.p(x0, y0, c);
      if (x0 === x1 && y0 === y1) return this;
      const e = 2 * err;
      if (e >= dy) { err += dy; x0 += sx; }
      if (e <= dx) { err += dx; y0 += sy; }
    }
  }
  /** Fill a polygon by scanning pixel centers, so edges stay hard. */
  poly(points, c) {
    const ys = points.map(p => p[1]);
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
      const hits = [];
      points.forEach(([ax, ay], i) => {
        const [bx, by] = points[(i + 1) % points.length];
        if ((ay <= y + .5) !== (by <= y + .5)) hits.push(ax + (y + .5 - ay) * (bx - ax) / (by - ay));
      });
      hits.sort((a, b) => a - b);
      for (let i = 0; i + 1 < hits.length; i += 2) for (let x = Math.round(hits[i]); x < Math.round(hits[i + 1]); x++) this.p(x, y, c);
    }
    return this;
  }
  disc(cx, cy, r, c) { for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r + r * .5) this.p(x, y, c); return this; }
  /** Stamp ASCII art. Letters come from `map`; '.' stays transparent. */
  art(x, y, rows, map) { rows.split('|').forEach((row, j) => [...row].forEach((ch, i) => { if (map[ch]) this.p(x + i, y + j, map[ch]); })); return this; }
  fn(fill) { for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) { const c = fill(x, y); if (c) this.p(x, y, c); } return this; }
  /** Raised edge: white top-left, gray bottom-right, black outer shadow. */
  bevel(x, y, w, h) { this.r(x, y, w, 1, W); this.r(x, y, 1, h, W); this.r(x + 1, y + h - 2, w - 2, 1, S); this.r(x + w - 2, y + 1, 1, h - 2, S); this.r(x, y + h - 1, w, 1, K); this.r(x + w - 1, y, 1, h, K); return this; }
}

const mix = (a, b, t) => { const A = hex(a), Bb = hex(b); return [0, 1, 2].map(i => Math.round(A[i] + (Bb[i] - A[i]) * t)).concat(255); };

/* ---------- 32 x 32 desktop icons ---------- */
const big = {
  computer(g) {
    g.r(5, 2, 22, 18, F).bevel(5, 2, 22, 18);
    g.r(8, 5, 16, 11, K).r(9, 6, 14, 9, LB);
    g.r(9, 6, 5, 1, SKY).r(9, 7, 2, 1, SKY);
    g.r(12, 11, 6, 3, W).r(12, 11, 6, 1, N);
    g.r(21, 17, 2, 1, LG);
    g.r(11, 20, 10, 2, S).r(11, 20, 10, 1, F);
    g.r(3, 22, 26, 7, F).bevel(3, 22, 26, 7);
    g.r(6, 24, 9, 1, S).r(6, 25, 9, 1, K);
    g.r(19, 24, 7, 2, G).box(19, 24, 7, 2, S);
    g.r(5, 27, 2, 1, LG);
  },
  recycle(g) {
    g.poly([[7, 7], [25, 7], [23, 29], [9, 29]], G);
    g.poly([[7, 7], [12, 7], [12, 29], [9, 29]], W);
    g.poly([[20, 7], [25, 7], [23, 29], [20, 29]], S);
    for (let x = 10; x < 24; x += 3) g.l(x, 9, x + (x < 16 ? 1 : x > 16 ? -1 : 0), 28, S);
    g.l(7, 7, 9, 29, K).l(25, 7, 23, 29, K).r(9, 29, 15, 1, K);
    g.r(5, 4, 22, 4, F).box(5, 4, 22, 4, K).r(6, 5, 20, 1, W).r(6, 6, 20, 1, S);
    const a = { a: '#00a040', b: '#006020', c: '#60e090' };
    g.art(11, 12, '....aaa...|...aac.a..|..aa...aa.|.aab...ab.|.b......b.|..aa..aa..|.aac..cab.|..bbaabb..|...cab....|....b.....', a);
  },
  folder(g) {
    g.r(3, 7, 10, 3, F3).r(4, 6, 8, 1, F2).r(3, 7, 1, 3, F4).r(12, 7, 1, 3, F4);
    g.r(3, 9, 26, 19, F4);
    g.r(4, 10, 24, 17, F3);
    g.r(4, 11, 24, 15, F2);
    g.r(4, 11, 24, 1, F1).r(4, 11, 1, 15, F1);
    g.r(5, 25, 23, 1, F3).r(27, 12, 1, 14, F3);
    g.box(3, 9, 26, 19, F5).p(3, 9, F2);
    g.r(3, 6, 1, 3, F5).r(4, 5, 8, 1, F5).r(12, 6, 1, 3, F5).r(13, 8, 16, 1, F5);
    g.r(5, 28, 25, 1, K).r(29, 11, 1, 18, K);
  },
  drive(g) {
    g.poly([[3, 12], [8, 7], [29, 7], [29, 12]], W).r(3, 12, 26, 12, G).r(3, 12, 26, 1, W).r(3, 12, 1, 12, W).r(4, 23, 25, 1, S).r(28, 13, 1, 11, S);
    g.l(3, 12, 8, 7, K).r(8, 7, 21, 1, K).r(29, 7, 1, 18, K).r(3, 24, 27, 1, K).r(3, 12, 1, 13, K);
    g.r(6, 19, 9, 2, S).r(6, 21, 9, 1, W).r(24, 20, 3, 2, LG).r(24, 22, 3, 1, GR);
  },
  document(g) {
    g.poly([[7, 1], [20, 1], [26, 7], [26, 30], [7, 30]], W);
    g.l(7, 1, 20, 1, K).r(7, 1, 1, 30, K).r(7, 30, 20, 1, K).r(26, 7, 1, 24, K).l(20, 1, 26, 7, K);
    g.r(20, 2, 1, 6, K).r(20, 7, 6, 1, K).poly([[21, 3], [25, 7], [21, 7]], G);
    [5, 8, 11].forEach(y => g.r(10, y, 8, 1, S));
    g.r(10, 14, 13, 1, S).r(10, 17, 13, 1, S);
    g.art(9, 19, '....bb....|....bb....|...bccb...|...b.cb...|..bb.cbb..|..b...cb..|.bbbbbcbb.|.b.....cb.|bbb...bbbb', { b: B, c: N });
    g.r(21, 22, 3, 1, S).r(21, 25, 3, 1, S);
    g.r(27, 8, 1, 23, S).r(8, 31, 20, 1, S);
  },
  text(g) {
    g.r(6, 4, 20, 26, W).box(6, 4, 20, 26, K);
    g.r(7, 5, 18, 3, T).r(7, 5, 18, 1, C);
    for (let x = 8; x < 25; x += 3) g.r(x, 2, 1, 5, S).p(x, 2, W);
    [10, 13, 16, 19, 22, 25].forEach((y, i) => g.r(9, y, i % 2 ? 11 : 14, 1, S));
    g.r(26, 5, 1, 26, S).r(7, 30, 20, 1, S);
  },
  cmd(g) {
    g.r(2, 4, 28, 24, F).bevel(2, 4, 28, 24);
    g.r(4, 6, 24, 4, N).r(5, 7, 2, 2, F).r(25, 7, 2, 2, F);
    g.r(4, 11, 24, 15, K);
    g.art(6, 13, 'W...|.W..|..W.|.W..|W...', { W: G });
    g.r(11, 17, 5, 1, W);
    g.art(6, 20, '.WW..W.WW|W...W..W.W|W...W..W.W|.WW.W..WW.', { W: G });
  },
  paint(g) {
    g.poly([[6, 8], [11, 4], [20, 3], [27, 7], [29, 13], [26, 17], [21, 18], [22, 24], [17, 27], [10, 26], [4, 21], [3, 14]], '#e7c78f');
    g.poly([[6, 8], [11, 4], [20, 3], [22, 5], [12, 6], [7, 10], [5, 16], [3, 14]], '#f6e3bd');
    [[6, 8, 11, 4], [11, 4, 20, 3], [20, 3, 27, 7], [27, 7, 29, 13], [29, 13, 26, 17], [26, 17, 21, 18], [21, 18, 22, 24], [22, 24, 17, 27], [17, 27, 10, 26], [10, 26, 4, 21], [4, 21, 3, 14], [3, 14, 6, 8]].forEach(([a, b, c, d]) => g.l(a, b, c, d, K));
    const dab = (x, y, c, h) => g.r(x + 1, y, 3, 5, c).r(x, y + 1, 5, 3, c).r(x + 1, y + 1, 1, 1, h);
    dab(8, 8, R, '#ff9090'); dab(15, 6, Y, W); dab(22, 8, GR, LG); dab(6, 15, B, SKY); dab(11, 20, P, '#d060d0');
    g.disc(16, 15, 2, F).r(15, 14, 2, 1, D);
    g.poly([[17, 26], [27, 18], [29, 20], [19, 28]], '#a05a20');
    g.l(17, 26, 27, 18, '#d08a40');
    g.poly([[27, 18], [30, 15], [31, 16], [29, 20]], G);
    g.poly([[17, 26], [19, 28], [15, 31], [13, 30]], K);
  },
  mine(g) {
    g.r(15, 3, 2, 26, K).r(3, 15, 26, 2, K);
    g.l(6, 6, 26, 26, K).l(7, 6, 27, 26, K).l(26, 6, 6, 26, K).l(25, 6, 5, 26, K);
    g.disc(16, 16, 10, K);
    g.r(10, 10, 5, 5, W).r(9, 11, 1, 3, W).r(11, 9, 3, 1, W);
    g.r(19, 22, 3, 1, D).r(22, 19, 1, 3, D);
  },
  globe(g) {
    g.disc(16, 16, 13, K);
    g.fn((x, y) => {
      const d = Math.hypot(x - 16, y - 16);
      if (d > 12.3) return null;
      const l = Math.max(0, 1 - Math.hypot(x - 11, y - 10) / 18);
      const isLand = (x > 8 && x < 17 && y > 6 && y < 14 && (x + y) % 11 < 8) || (x > 13 && x < 21 && y > 15 && y < 25 && (x * 2 + y) % 13 < 9) || (x > 20 && y > 8 && y < 15);
      return isLand ? mix('#106010', '#60d060', l) : mix('#0030a0', '#60b0ff', l);
    });
    g.r(11, 8, 3, 1, W).r(10, 9, 2, 1, W);
  },
};

/* ---------- 16 x 16 small icons ---------- */
const small = {
  computer(g) {
    g.r(2, 1, 12, 9, F).bevel(2, 1, 12, 9).r(4, 3, 8, 5, LB).r(4, 3, 8, 1, N).p(11, 8, LG);
    g.r(6, 10, 4, 1, S).r(1, 11, 14, 4, F).bevel(1, 11, 14, 4).r(3, 12, 4, 1, S).p(12, 12, LG);
  },
  recycle(g) {
    g.poly([[3, 3], [13, 3], [12, 15], [4, 15]], G).r(4, 4, 2, 11, W).r(10, 4, 2, 11, S);
    g.l(3, 3, 4, 15, K).l(13, 3, 12, 15, K).r(4, 15, 9, 1, K).r(2, 1, 12, 2, F).box(2, 1, 12, 3, K);
    g.art(5, 6, '..a..|.a.a.|aa.aa|.....|aaaaa', { a: '#00a040' });
  },
  folder(g) {
    g.r(1, 3, 6, 2, F3).r(1, 2, 6, 1, F5).r(1, 5, 14, 9, F2).r(1, 5, 14, 1, F1).r(1, 5, 1, 9, F1).box(1, 4, 14, 10, F5).p(1, 3, F5).p(7, 3, F5);
    g.r(2, 14, 14, 1, K).r(15, 5, 1, 10, K);
  },
  drive(g) {
    g.r(1, 6, 14, 7, G).r(1, 6, 14, 1, W).r(1, 6, 1, 7, W).r(2, 12, 13, 1, S).box(1, 5, 14, 8, K).poly([[2, 5], [4, 3], [14, 3], [14, 5]], W).l(1, 5, 3, 3, K).r(3, 3, 12, 1, K).r(14, 3, 1, 3, K).r(3, 9, 5, 1, S).r(11, 9, 2, 2, LG);
  },
  'folder-open'(g) {
    g.r(1, 3, 6, 2, F3).r(1, 2, 6, 1, F5).box(1, 4, 12, 10, F5).r(2, 5, 10, 8, F4);
    g.poly([[3, 7], [16, 7], [13, 14], [1, 14]], F2).l(3, 7, 15, 7, F1).l(3, 7, 1, 13, F5).l(15, 7, 12, 14, F5).r(1, 14, 12, 1, F5);
  },
  document(g) {
    g.r(3, 1, 10, 14, W).box(3, 1, 10, 14, K).r(10, 1, 3, 3, F).l(10, 1, 13, 4, K).r(10, 1, 1, 3, K).r(10, 4, 3, 1, K);
    g.r(5, 4, 4, 1, S).art(4, 7, '...bb...|..b..b..|..bbbb..|.b....b.|bbb..bbb', { b: B }).r(13, 2, 1, 14, S).r(4, 15, 10, 1, S);
  },
  text(g) {
    g.r(3, 1, 10, 14, W).box(3, 1, 10, 14, K);
    [4, 6, 8, 10, 12].forEach((y, i) => g.r(5, y, i % 2 ? 4 : 6, 1, S));
    g.r(13, 2, 1, 14, S);
  },
  cmd(g) {
    g.r(1, 2, 14, 12, F).bevel(1, 2, 14, 12).r(2, 3, 11, 2, N).r(2, 5, 11, 7, K).art(3, 6, 'w..|.w.|w..', { w: W }).r(7, 9, 3, 1, W);
  },
  paint(g) {
    g.disc(7, 8, 6, '#e7c78f').disc(7, 8, 6, '#e7c78f');
    g.art(1, 2, '...KKKKKKK...|..K.......K..|.K.........K.|K...........K|K...........K|K...........K|K...........K|K...........K|.K.........K.|..K.......K..|...KKKKKKK...', { K });
    g.r(3, 5, 2, 2, R).r(6, 4, 2, 2, Y).r(9, 5, 2, 2, GR).r(4, 9, 2, 2, B).p(7, 7, F);
    g.l(8, 13, 14, 7, '#a05a20').l(9, 13, 15, 7, '#a05a20').r(14, 5, 2, 2, K);
  },
  mine(g) {
    g.r(7, 1, 2, 14, K).r(1, 7, 14, 2, K).disc(8, 8, 5, K).r(5, 5, 2, 2, W).p(3, 3, K).p(12, 3, K).p(3, 12, K).p(12, 12, K);
  },
  globe(g) {
    g.disc(8, 8, 7, K);
    g.fn((x, y) => (Math.hypot(x - 8, y - 8) > 6.3 ? null : (x > 3 && x < 8 && y > 3 && y < 8) || (x > 7 && x < 12 && y > 8 && y < 13) ? '#20a020' : '#2080f0'));
    g.r(5, 4, 2, 1, W);
  },
  speaker(g) { g.r(2, 6, 3, 4, F).box(2, 6, 3, 4, K).poly([[5, 6], [9, 2], [9, 14], [5, 10]], F).l(5, 6, 9, 2, K).l(5, 10, 9, 14, K).r(9, 2, 1, 13, K).r(11, 6, 1, 4, K).r(13, 4, 1, 8, K).p(12, 5, K).p(12, 10, K); },
  network(g) { g.r(1, 2, 8, 7, F).box(1, 2, 8, 7, K).r(2, 3, 6, 4, LB).r(7, 7, 8, 7, F).box(7, 7, 8, 7, K).r(8, 8, 6, 4, T).r(4, 9, 1, 4, K).r(4, 13, 3, 1, K); },
};

/* ---------- 16 x 16 toolbar glyphs ---------- */
const tool = {
  new(g) { g.r(3, 1, 8, 14, W).r(11, 4, 2, 11, W).box(3, 1, 10, 14, K).r(10, 1, 3, 3, F).l(10, 1, 13, 4, K).r(10, 1, 1, 3, K).r(10, 4, 3, 1, K); },
  open(g) { g.r(1, 3, 5, 1, K).r(1, 4, 12, 10, O).r(2, 5, 10, 8, Y).box(0, 4, 13, 11, K); g.poly([[3, 8], [16, 8], [12, 15], [0, 15]], Y).l(3, 8, 15, 8, K).l(3, 8, 0, 14, K).l(15, 8, 12, 14, K).r(0, 14, 13, 1, K); g.art(9, 1, '.KKK....|K...K.K.|....KK..|...KKK..', { K }); },
  save(g) { g.r(1, 1, 14, 14, O).box(1, 1, 14, 14, K).r(4, 2, 8, 6, W).r(5, 3, 6, 1, S).r(5, 5, 6, 1, S).r(4, 10, 8, 5, G).box(4, 10, 8, 5, K).r(9, 11, 2, 3, K); },
  print(g) { g.r(4, 1, 8, 6, W).box(4, 1, 8, 6, K).r(1, 6, 14, 6, G).box(1, 6, 14, 6, K).r(2, 7, 12, 1, W).r(12, 8, 2, 1, Y).r(4, 10, 8, 5, W).box(4, 10, 8, 5, K).r(5, 12, 6, 1, S); },
  preview(g) { g.r(2, 1, 9, 13, W).box(2, 1, 9, 13, K).r(4, 3, 5, 1, S).r(4, 5, 3, 1, S); g.disc(9, 9, 3, K).disc(9, 9, 2, C).p(8, 8, W); g.l(11, 12, 14, 15, K).l(12, 12, 15, 15, K); },
  find(g) { g.r(2, 3, 5, 8, K).r(9, 3, 5, 8, K).r(3, 4, 2, 5, S).r(10, 4, 2, 5, S).r(7, 5, 2, 3, K).r(1, 10, 6, 4, K).r(9, 10, 6, 4, K).r(2, 11, 4, 2, N).r(10, 11, 4, 2, N).r(3, 1, 3, 2, K).r(10, 1, 3, 2, K); },
  cut(g) { g.l(5, 1, 9, 9, K).l(10, 1, 6, 9, K).l(6, 1, 9, 7, S); g.box(2, 10, 4, 4, N).box(10, 10, 4, 4, N).p(6, 9, N).p(9, 9, N); },
  copy(g) { g.r(1, 1, 8, 10, W).box(1, 1, 8, 10, K).r(3, 3, 4, 1, N).r(3, 5, 4, 1, N).r(3, 7, 4, 1, N); g.r(6, 5, 9, 10, W).box(6, 5, 9, 10, K).r(8, 7, 5, 1, N).r(8, 9, 5, 1, N).r(8, 11, 5, 1, N); },
  paste(g) { g.r(2, 2, 10, 13, O).box(2, 2, 10, 13, K).r(5, 1, 4, 3, G).box(5, 1, 4, 3, K); g.r(7, 6, 8, 9, W).box(7, 6, 8, 9, K).r(9, 8, 4, 1, N).r(9, 10, 4, 1, N).r(9, 12, 4, 1, N); },
  undo(g) { g.art(1, 3, '...K........|..KN........|.KNNKKKK....|KNNNNNNNK...|.KNNKKKKNK..|..KN....KNK.|...K.....KNK|.........KNK|........KNK.|.......KK...', { K, N }); },
  redo(g) { g.art(3, 3, '........K...|........NK..|....KKKKNNK.|...KNNNNNNNK|..KNKKKKNNK.|.KNK....NK..|KNK.....K...|KNK.........|.KNK........|...KK.......', { K, N }); },
  date(g) { g.r(1, 2, 14, 13, W).box(1, 2, 14, 13, K).r(2, 3, 12, 3, N); [4, 7, 10].forEach(x => { [7, 10].forEach(y => g.r(x, y, 2, 2, x === 7 && y === 10 ? R : S)); }); g.r(4, 1, 1, 3, K).r(11, 1, 1, 3, K); },
  bold(g) { g.art(4, 2, 'KKKKKK..|.KK..KK.|.KK..KK.|.KK..KK.|.KKKKK..|.KK..KK.|.KK..KK.|.KK..KK.|.KK..KK.|KKKKKK..', { K }); },
  italic(g) { g.art(4, 2, '...KKKK.|....KK..|....KK..|...KK...|...KK...|...KK...|..KK....|..KK....|..KK....|.KKKK...', { K }); },
  underline(g) { g.art(3, 1, 'KKK..KKK|.K....K.|.K....K.|.K....K.|.K....K.|.K....K.|.K....K.|.KK..KK.|..KKKK..', { K }).r(3, 12, 9, 1, K); },
  color(g) { g.disc(7, 7, 6, K); g.fn((x, y) => (Math.hypot(x - 7, y - 7) > 5.3 ? null : '#e7c78f')); g.r(4, 4, 2, 2, R).r(8, 3, 2, 2, Y).r(9, 7, 2, 2, B).r(4, 8, 2, 2, GR); g.r(1, 14, 14, 1, R); },
  left(g) { [2, 6, 10].forEach(y => g.r(2, y, 12, 1, K)); [4, 8, 12].forEach(y => g.r(2, y, 8, 1, K)); },
  center(g) { [2, 6, 10].forEach(y => g.r(2, y, 12, 1, K)); [4, 8, 12].forEach(y => g.r(4, y, 8, 1, K)); },
  right(g) { [2, 6, 10].forEach(y => g.r(2, y, 12, 1, K)); [4, 8, 12].forEach(y => g.r(6, y, 8, 1, K)); },
  bullets(g) { [2, 7, 12].forEach(y => { g.r(1, y, 3, 3, N).p(1, y, B); g.r(6, y + 1, 9, 1, K); }); },
  views(g) { g.r(1, 1, 6, 6, W).box(1, 1, 6, 6, K).r(9, 1, 6, 6, W).box(9, 1, 6, 6, K).r(1, 9, 6, 6, W).box(1, 9, 6, 6, K).r(9, 9, 6, 6, W).box(9, 9, 6, 6, K).r(3, 3, 2, 2, B).r(11, 3, 2, 2, GR).r(3, 11, 2, 2, R).r(11, 11, 2, 2, O); },
  help(g) { g.disc(8, 8, 7, N); g.fn((x, y) => (Math.hypot(x - 8, y - 8) > 6.3 ? null : mix(SKY, '#2050d0', Math.min(1, Math.hypot(x - 5, y - 5) / 10)))); g.art(6, 4, '.WWW.|W...W|...W.|..W..|.....|..W..', { W }).p(5, 5, W); },
  search(g) { g.disc(6, 6, 5, K).disc(6, 6, 4, C).r(4, 3, 2, 1, W); g.l(9, 9, 14, 14, K).l(10, 9, 15, 14, K).l(9, 10, 14, 15, K); },
  go(g) { g.r(0, 0, 16, 16, GR).box(0, 0, 16, 16, K).r(1, 1, 14, 1, LG).r(1, 1, 1, 14, LG).art(3, 3, '.....W....|.....WW...|WWWWWWWW..|WWWWWWWWW.|WWWWWWWW..|.....WW...|.....W....', { W }); },
  up(g) { g.art(2, 1, '.....K......|....KNK.....|...KNNNK....|..KNNNNNK...|.KKKNNNKKK..|...KNNNK....|...KNNNKKKKK|...KNNNNNNNK|...KKKKKKKKK', { K, N }); },
  drop(g) { g.art(5, 6, 'KKKKKKK|.KKKKK.|..KKK..|...K...', { K }); },
  'arrow-r'(g) { g.art(6, 4, 'K...|KK..|KKK.|KKKK|KKK.|KK..|K...', { K }); },
  'arrow-l'(g) { g.art(6, 4, '...K|..KK|.KKK|KKKK|.KKK|..KK|...K', { K }); },
  'arrow-r-w'(g) { g.art(6, 4, 'W...|WW..|WWW.|WWWW|WWW.|WW..|W...', { W }); },
};

/* ---------- 16 x 16 Paint tools ---------- */
const paintTools = {
  eraser(g) { g.poly([[3, 9], [10, 2], [14, 6], [7, 13]], '#f7a0a0').poly([[3, 9], [6, 6], [10, 10], [7, 13]], W); g.l(3, 9, 10, 2, K).l(10, 2, 14, 6, K).l(14, 6, 7, 13, K).l(7, 13, 3, 9, K).l(6, 6, 10, 10, K); },
  fill(g) { g.poly([[2, 8], [8, 2], [13, 7], [7, 13]], G).l(2, 8, 8, 2, K).l(8, 2, 13, 7, K).l(13, 7, 7, 13, K).l(7, 13, 2, 8, K); g.r(6, 1, 1, 5, K).r(13, 8, 2, 5, B).r(14, 7, 1, 1, B); g.r(1, 13, 5, 2, B); },
  picker(g) { g.l(2, 13, 9, 6, K).l(3, 13, 10, 7, W).p(2, 14, K).l(4, 13, 10, 7, K); g.r(10, 2, 4, 4, K).r(9, 5, 3, 3, K).p(11, 4, S); },
  zoom(g) { g.disc(6, 6, 5, K).disc(6, 6, 4, C).r(4, 3, 2, 1, W); g.l(9, 9, 14, 14, K).l(10, 9, 15, 14, K); },
  pencil(g) { g.poly([[2, 11], [10, 3], [13, 6], [5, 14]], Y).l(2, 11, 10, 3, K).l(10, 3, 13, 6, K).l(13, 6, 5, 14, K).r(9, 4, 1, 1, R).r(10, 3, 3, 3, R).l(10, 3, 13, 6, K); g.l(2, 11, 1, 15, K).l(5, 14, 1, 15, K); },
  brush(g) { g.l(14, 1, 8, 8, '#a05a20').l(14, 2, 9, 8, '#a05a20').l(13, 1, 8, 7, K).l(15, 2, 9, 9, K); g.r(6, 7, 3, 3, G).poly([[6, 9], [9, 10], [7, 14], [2, 15]], K); },
  spray(g) { g.r(3, 6, 6, 9, G).box(3, 6, 6, 9, K).r(4, 7, 1, 7, W).r(5, 3, 2, 3, S).box(5, 3, 2, 3, K); [[10, 2], [13, 1], [12, 4], [14, 5], [11, 6], [14, 8], [10, 9], [12, 11]].forEach(([x, y]) => g.p(x, y, K)); },
  line(g) { g.l(2, 13, 13, 2, K); },
  rectangle(g) { g.box(2, 3, 12, 10, K); },
  ellipse(g) { g.art(1, 3, '....KKKKKK....|..KK......KK..|.K..........K.|K............K|K............K|.K..........K.|..KK......KK..|....KKKKKK....', { K }); },
};

/* ---------- Window caption glyphs (16 x 14, drawn on the button face) ---------- */
const caption = {
  minimize(g) { g.r(4, 9, 6, 2, K); },
  maximize(g) { g.box(3, 2, 9, 9, K).r(3, 3, 9, 1, K); },
  restore(g) { g.box(5, 2, 7, 6, K).r(5, 3, 7, 1, K).r(3, 5, 7, 6, F).box(3, 5, 7, 6, K).r(3, 6, 7, 1, K); },
  close(g) { g.art(4, 3, 'KK....KK|.KK..KK.|..KKKK..|...KK...|..KKKK..|.KK..KK.|KK....KK', { K }); },
  'maximize-off'(g) { g.box(4, 3, 9, 9, W).r(4, 4, 9, 1, W).box(3, 2, 9, 9, S).r(3, 3, 9, 1, S); },
};

/* ---------- Minesweeper ---------- */
const NUMBER = {
  1: '..BB..|.BBB..|BBBB..|..BB..|..BB..|..BB..|BBBBBB',
  2: '.GGGG.|GG..GG|....GG|...GG.|..GG..|.GG...|GGGGGG',
  3: 'RRRRR.|....RR|....RR|.RRRR.|....RR|....RR|RRRRR.',
  4: '..NNN.|.N.NN.|N..NN.|NNNNNN|...NN.|...NN.|...NN.',
  5: 'MMMMMM|MM....|MMMMM.|....MM|....MM|MM..MM|.MMMM.',
  6: '.TTTT.|TT....|TTTTT.|TT..TT|TT..TT|TT..TT|.TTTT.',
  7: 'KKKKKK|....KK|...KK.|...KK.|..KK..|..KK..|..KK..',
  8: '.SSSS.|SS..SS|SS..SS|.SSSS.|SS..SS|SS..SS|.SSSS.',
};
const face = (g, mouth, eyes = 'dot') => {
  g.disc(8, 8, 8, K).disc(8, 8, 7, Y);
  if (eyes === 'dot') g.r(5, 5, 2, 2, K).r(10, 5, 2, 2, K);
  if (eyes === 'x') g.art(4, 4, 'K.K.K.K|.K...K.|K.K.K.K', { K });
  if (eyes === 'shades') g.r(3, 5, 11, 1, K).r(4, 6, 4, 2, K).r(9, 6, 4, 2, K);
  mouth(g);
};
const mines = {
  flag(g) { g.r(7, 3, 1, 8, K).poly([[8, 3], [8, 8], [3, 6]], R).r(5, 11, 5, 1, K).r(4, 12, 7, 1, K); },
  bomb(g) { g.r(7, 2, 2, 12, K).r(2, 7, 12, 2, K).disc(8, 8, 4, K).r(6, 6, 2, 2, W).p(4, 4, K).p(11, 4, K).p(4, 11, K).p(11, 11, K); },
  wrong(g) { g.r(7, 2, 2, 12, K).r(2, 7, 12, 2, K).disc(8, 8, 4, K).r(6, 6, 2, 2, W).l(2, 2, 13, 13, R).l(13, 2, 2, 13, R); },
  smile(g) { face(g, m => m.r(5, 10, 1, 1, K).r(6, 11, 5, 1, K).r(11, 10, 1, 1, K)); },
  wow(g) { face(g, m => m.box(7, 10, 3, 3, K).p(8, 11, Y)); },
  dead(g) { face(g, m => m.r(6, 11, 5, 1, K).p(5, 12, K).p(11, 12, K), 'x'); },
  cool(g) { face(g, m => m.r(5, 10, 1, 1, K).r(6, 11, 5, 1, K).r(11, 10, 1, 1, K), 'shades'); },
};
for (const [digit, art] of Object.entries(NUMBER)) mines[`n${digit}`] = g => g.art(5, 4, art, { B, G: GR, R, N, M, T, K, S });

/* ---------- Other artwork ---------- */
function flag(g) {
  const wave = x => Math.round(Math.sin((x + 2) / 2.8) * 1.2);
  const trail = (x, y, h) => g.r(x, y + wave(x), 1, h, K);
  trail(0, 4, 2); trail(0, 9, 2); trail(1, 3, 3); trail(1, 8, 3); trail(2, 3, 2); trail(2, 9, 2); trail(3, 3, 3); trail(3, 8, 3);
  for (let x = 4; x < 16; x++) {
    const y = wave(x), left = x < 10;
    g.r(x, 2 + y, 1, 5, left ? '#e0341c' : '#3cb034');
    g.r(x, 8 + y, 1, 5, left ? '#2c6cdc' : '#f0c014');
    if (x === 9) g.r(x, 2 + y, 1, 11, K);
    g.p(x, 7 + y, K);
    g.p(x, 1 + y, K);
    g.p(x, 13 + y, K);
  }
}

function tile(g) {
  g.fn((x, y) => {
    const dx = x - 24, dy = y - 25, d = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
    if (d < 5) return mix('#ffe080', '#c06010', d / 5);
    const petal = 13 + 6 * Math.abs(Math.cos(a * 4));
    if (d < petal) return mix('#ffb040', '#f04810', Math.min(1, (d - 5) / 14 + .15 * Math.abs(Math.sin(a * 8))));
    return mix('#f8d090', '#b83808', Math.min(1, y / 47));
  });
}

function monitor(g) {
  g.r(10, 0, 160, 118, F).r(10, 0, 160, 1, W).r(10, 0, 1, 118, W).r(11, 116, 158, 1, S).r(168, 1, 1, 116, S).r(10, 117, 160, 1, K).r(169, 0, 1, 118, K);
  g.r(19, 9, 142, 100, S).r(19, 9, 142, 1, D).r(19, 9, 1, 100, D).r(20, 108, 141, 1, W).r(160, 10, 1, 99, W);
  g.r(21, 11, 138, 96, LB);
  g.r(27, 16, 8, 7, W).r(40, 16, 8, 7, F2).r(27, 30, 8, 7, F2);
  g.r(55, 26, 90, 58, F).r(55, 26, 90, 1, W).r(55, 26, 1, 58, W).r(55, 83, 90, 1, K).r(144, 26, 1, 58, K);
  for (let x = 57; x < 143; x++) g.r(x, 28, 1, 6, mix('#0a246a', SKY, (x - 57) / 86));
  g.r(57, 36, 86, 46, W).r(61, 40, 40, 1, S).r(61, 44, 70, 1, S).r(61, 48, 58, 1, S);
  g.r(21, 100, 138, 7, F).r(21, 100, 138, 1, W).r(23, 102, 12, 4, S).r(145, 102, 12, 4, S);
  g.r(150, 113, 8, 2, LG);
  g.r(64, 118, 52, 4, S).r(64, 118, 52, 1, F);
  g.r(46, 122, 88, 8, F).r(46, 122, 88, 1, W).r(46, 129, 88, 1, K).r(133, 122, 1, 8, K);
}

function led(g, digit) {
  const seg = ['1111110', '0110000', '1101101', '1111001', '0110011', '1011011', '1011111', '1110000', '1111111', '1111011'][digit];
  const on = '#ff0000', off = '#600000';
  const parts = [
    i => { for (let n = 0; n < 2; n++) g.r(2 + n, 1 + n, 9 - n * 2, 1, i); },
    i => { for (let n = 0; n < 2; n++) g.r(11 - n, 2 + n, 1, 8 - n * 2, i); },
    i => { for (let n = 0; n < 2; n++) g.r(11 - n, 13 + n, 1, 8 - n * 2, i); },
    i => { for (let n = 0; n < 2; n++) g.r(2 + n, 21 - n, 9 - n * 2, 1, i); },
    i => { for (let n = 0; n < 2; n++) g.r(1 + n, 13 + n, 1, 8 - n * 2, i); },
    i => { for (let n = 0; n < 2; n++) g.r(1 + n, 2 + n, 1, 8 - n * 2, i); },
    i => { g.r(3, 10, 7, 1, i); g.r(2, 11, 9, 1, i); g.r(3, 12, 7, 1, i); },
  ];
  g.r(0, 0, 13, 23, K);
  parts.forEach((draw, i) => draw(seg[i] === '1' ? on : off));
}

function navButton(g, rows) {
  g.disc(11, 11, 10, N);
  g.fn((x, y) => (Math.hypot(x - 11, y - 11) > 9.3 ? null : mix('#9cc8f4', '#1a4fa8', Math.min(1, Math.hypot(x - 8, y - 6) / 15))));
  g.art(5, 6, rows, { W });
}

function shortcut(g) {
  g.r(0, 0, 11, 11, W).box(0, 0, 11, 11, K);
  g.art(2, 2, '..KKKKK|....KKK|...K.KK|..K..K.|.K.....|K......', { K });
}

/** All sprites as name -> [width, height, draw]. */
export function buildSprites() {
  const sprites = {};
  const add = (name, w, h, draw) => { sprites[name] = [w, h, draw]; };
  for (const [name, draw] of Object.entries(big)) add(`${name}-32`, 32, 32, draw);
  for (const [name, draw] of Object.entries(small)) add(`${name}-16`, 16, 16, draw);
  for (const [name, draw] of Object.entries(tool)) add(`t-${name}`, 16, 16, draw);
  for (const [name, draw] of Object.entries(paintTools)) add(`p-${name}`, 16, 16, draw);
  for (const [name, draw] of Object.entries(caption)) add(`c-${name}`, 16, 14, draw);
  for (const [name, draw] of Object.entries(mines)) add(`m-${name}`, 16, 16, draw);
  for (let digit = 0; digit < 10; digit++) add(`led-${digit}`, 13, 23, g => led(g, digit));
  add('flag', 16, 16, flag);
  add('tile', 48, 48, tile);
  add('monitor', 180, 130, monitor);
  add('shortcut', 11, 11, shortcut);
  add('nav-back', 22, 22, g => navButton(g, '....WW......|...WWW......|..WWW.......|.WWWWWWWWWWW|WWWWWWWWWWWW|.WWWWWWWWWWW|..WWW.......|...WWW......|....WW......'));
  add('nav-forward', 22, 22, g => navButton(g, '......WW....|......WWW...|.......WWW..|WWWWWWWWWWW.|WWWWWWWWWWWW|WWWWWWWWWWW.|.......WWW..|......WWW...|......WW....'));
  add('r-indent-l', 9, 15, g => g.art(0, 0, '....K....|...KFK...|..KFFFK..|.KFFFFFK.|KFFFFFFFK|KFFFFFFFK|.KFFFFFK.|..KFFFK..|...KFK...|....K....|KKKKKKKKK|KFFFFFFFK|KFFFFFFFK|KFFFFFFFK|KKKKKKKKK', { K, F }));
  add('r-indent-r', 9, 6, g => g.art(0, 0, '....K....|...KFK...|..KFFFK..|.KFFFFFK.|KFFFFFFFK|KKKKKKKKK', { K, F }));
  return sprites;
}

/** Shelf-pack sprites into one image and return the sheet plus each sprite's position. */
export function packSheet(sprites) {
  const WIDTH = 512;
  const names = Object.keys(sprites).sort((a, b) => sprites[b][1] - sprites[a][1] || a.localeCompare(b));
  const placed = {};
  let x = 0, y = 0, shelf = 0;
  for (const name of names) {
    const [w, h] = sprites[name];
    if (x + w > WIDTH) { x = 0; y += shelf + 1; shelf = 0; }
    placed[name] = { x, y, w, h };
    x += w + 1;
    shelf = Math.max(shelf, h);
  }
  const sheet = new Pixels(WIDTH, y + shelf);
  for (const name of names) {
    const { x: ox, y: oy, w, h } = placed[name];
    const g = new Pixels(w, h);
    sprites[name][2](g);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const at = (j * w + i) * 4;
      if (g.data[at + 3]) sheet.p(ox + i, oy + j, [...g.data.subarray(at, at + 4)]);
    }
  }
  return { sheet, placed };
}

const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = buffer => { let c = 0xffffffff; for (const byte of buffer) c = crcTable[(c ^ byte) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]);
  const length = Buffer.alloc(4); length.writeUInt32BE(data.length);
  const check = Buffer.alloc(4); check.writeUInt32BE(crc(body));
  return Buffer.concat([length, body, check]);
}
export function encodePng({ w, h, data }) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(w, 0); header.writeUInt32BE(h, 4); header.set([8, 6, 0, 0, 0], 8);
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) Buffer.from(data.buffer, y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

/* ---------- Mouse cursors, as crisp SVG so they stay sharp on any display ---------- */
const CURSORS = {
  arrow: `X
XX
XOX
XOOX
XOOOX
XOOOOX
XOOOOOX
XOOOOOOX
XOOOOOOOX
XOOOOOOOOX
XOOOOOXXXXX
XOOXOOX
XOX XOOX
XX  XOOX
X    XOOX
     XOOX
      XOOX
      XOOX
       XX`,
  text: `XXX.XXX
...X...
...X...
...X...
...X...
...X...
...X...
...X...
...X...
...X...
...X...
...X...
...X...
...X...
...X...
XXX.XXX`,
  'resize-ew': `....X.......X....
...XX.......XX...
..XOX.......XOX..
.XOOXXXXXXXXXOOX.
XOOOOOOOOOOOOOOOX
.XOOXXXXXXXXXOOX.
..XOX.......XOX..
...XX.......XX...
....X.......X....`,
  'resize-ns': `....X....
...XOX...
..XOOOX..
.XOOOOOX.
XXXXOXXXX
...XOX...
...XOX...
...XOX...
...XOX...
...XOX...
...XOX...
...XOX...
XXXXOXXXX
.XOOOOOX.
..XOOOX..
...XOX...
....X....`,
  'resize-nwse': `XXXXXXX......
XOOOOX.......
XOOOX........
XOOOOX.......
XOXOOOX......
XX.XOOOX.....
X...XOOOX...X
.....XOOOX.XX
......XOOOXOX
.......XOOOOX
........XOOOX
.......XOOOOX
......XXXXXXX`,
  'resize-nesw': `......XXXXXXX
.......XOOOOX
........XOOOX
.......XOOOOX
......XOOOXOX
.....XOOOX.XX
X...XOOOX...X
XX.XOOOX.....
XOXOOOX......
XOOOOX.......
XOOOX........
XOOOOX.......
XXXXXXX......`,
};

export function buildCursors() {
  return Object.fromEntries(Object.entries(CURSORS).map(([name, art]) => {
    const rows = art.split('\n');
    const w = Math.max(...rows.map(r => r.length));
    const paths = { X: '', O: '' };
    rows.forEach((row, y) => [...row].forEach((ch, x) => { if (paths[ch] !== undefined) paths[ch] += `M${x} ${y}h1v1h-1z`; }));
    const size = Math.max(w, rows.length);
    return [`${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><path fill="#000" d="${paths.X}"/><path fill="#fff" d="${paths.O}"/></svg>\n`];
  }));
}
