#!/usr/bin/env python3
"""Measure where a product's thing sits in its first pictures, for the door's blend (content/site.json, doors).

The studio's growing picture lands its anchor (a span across the thing and its middle height) on the same anchor in
the product's own first picture. This script measures that anchor in the product's pictures, so it can be measured
again whenever the product re-shoots them (same file names, the thing moved):

  python3 scripts/anchors.py <folder of the product's build> <kind> <file> [<file> ...]

kind:
  disc  TROPHYZ: the race disc (its blue sea, its red route and its pale height lines), the wood base left out
  red   any red route alone

Prints one line per file: its size and the anchor [left, right, middle height] in that picture's own pixels, ready
for "pictures" in content/site.json. Needs Pillow. Reads only; writes nothing.
"""
import sys
from PIL import Image


def keep(kind, r, g, b):
    red = r > 160 and g < 90 and b < 90
    if kind == 'red':
        return red
    blue = b > 140 and r < 90 and b > g + 40
    # the height lines: a cool grey, never the wood's warm pale top (its red runs ahead of its blue)
    pale = r > 110 and abs(r - g) < 12 and abs(g - b) < 14 and b >= r - 4
    return red or blue or pale


def measure(path, kind):
    im = Image.open(path).convert('RGB')
    w, h = im.size
    small = im.resize((w // 2, h // 2))
    px = small.load()
    xs, ys = [], []
    for y in range(small.size[1]):
        for x in range(small.size[0]):
            if keep(kind, *px[x, y]):
                xs.append(x * 2)
                ys.append(y * 2)
    if len(xs) < 50:
        return (w, h), None
    xs.sort()
    ys.sort()
    q = lambda a, f: a[min(len(a) - 1, int(f * len(a)))]
    # the thing's span without stray pixels: from the 0.5th to the 99.5th percentile
    x0, x1, y0, y1 = q(xs, 0.005), q(xs, 0.995), q(ys, 0.005), q(ys, 0.995)
    return (w, h), [x0, x1, round((y0 + y1) / 2)]


if __name__ == '__main__':
    if len(sys.argv) < 4:
        print(__doc__)
        sys.exit(2)
    folder, kind = sys.argv[1], sys.argv[2]
    for f in sys.argv[3:]:
        size, a = measure(f'{folder}/{f}', kind)
        print(f'{f}: "size": [{size[0]}, {size[1]}], "anchor": {a}')
