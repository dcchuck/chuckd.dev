/** Fill only the connected RGBA region; rows never wrap at canvas edges. */
export function fillPixels(data: Uint8ClampedArray, width: number, height: number, x: number, y: number, color: readonly number[]) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const offset = (y * width + x) * 4;
  const from = [...data.slice(offset, offset + 4)];
  if (from.every((value, i) => value === color[i])) return;
  const queue = [y * width + x];
  while (queue.length) {
    const index = queue.pop()!;
    const pixel = index * 4;
    if (!from.every((value, i) => data[pixel + i] === value)) continue;
    data.set(color, pixel);
    const column = index % width;
    if (column > 0) queue.push(index - 1);
    if (column < width - 1) queue.push(index + 1);
    if (index >= width) queue.push(index - width);
    if (index < width * (height - 1)) queue.push(index + width);
  }
}
