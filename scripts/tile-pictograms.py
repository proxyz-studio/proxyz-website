#!/usr/bin/env python3
"""Build 12I: the live film's tile pictures, src/world/tile-icons.webp: the four TAPZ tile drawings (scripts/tile-pictograms.mjs,
the one source), side by side left to right, each square the 24 mm middle of a tile face, on a clear ground (the black tile
shows through). Drawn 8 times larger and shrunk, so the edges are smooth.

    python3 scripts/tile-pictograms.py [--preview <png on grey>]
"""
import json
import os
import subprocess
import sys

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data = json.loads(subprocess.check_output(['node', os.path.join(ROOT, 'scripts', 'tile-pictograms.mjs'), '--json']))
UNIT, COL, FACES, PARTS = data['unit'], data['colours'], data['faces'], data['parts']
SQ, SS = 256, 8          # a square's size in the atlas, and the supersampling
MM = 24.0
big = SQ * SS


def px(g):
    return (big / 2 + (g - 12) * UNIT * big / MM)


def rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


atlas = Image.new('RGBA', (SQ * len(FACES), SQ), (0, 0, 0, 0))
for i, face in enumerate(FACES):
    col = Image.new('RGB', (big, big), (0, 0, 0))
    cov = Image.new('L', (big, big), 0)
    dc, da = ImageDraw.Draw(col), ImageDraw.Draw(cov)
    for part in PARTS[face]:
        c = rgb(COL[part['tone']])
        for s in part['shapes']:
            outer = [(px(x), px(y)) for x, y in s['outer']]
            dc.polygon(outer, fill=c)
            da.polygon(outer, fill=255)
            for h in s['holes']:
                hp = [(px(x), px(y)) for x, y in h]
                dc.polygon(hp, fill=(0, 0, 0))
                da.polygon(hp, fill=0)
    col = col.resize((SQ, SQ), Image.LANCZOS)
    cov = cov.resize((SQ, SQ), Image.LANCZOS)
    # colour where covered (the colour image is the true colour on black: divide the black back out at the edges)
    px_c, px_a = col.load(), cov.load()
    tile = Image.new('RGBA', (SQ, SQ))
    pt = tile.load()
    for y in range(SQ):
        for x in range(SQ):
            a = px_a[x, y]
            if a == 0:
                pt[x, y] = (0, 0, 0, 0)
                continue
            r, g, b = px_c[x, y]
            k = 255.0 / a
            pt[x, y] = (min(255, round(r * k)), min(255, round(g * k)), min(255, round(b * k)), a)
    atlas.paste(tile, (i * SQ, 0))

out = os.path.join(ROOT, 'src', 'world', 'tile-icons.webp')
atlas.save(out, 'WEBP', lossless=True, quality=100, method=6)
print('wrote', os.path.relpath(out, ROOT), os.path.getsize(out), 'bytes')
if '--preview' in sys.argv:
    p = sys.argv[sys.argv.index('--preview') + 1]
    bg = Image.new('RGBA', atlas.size, (12, 12, 12, 255))
    bg.alpha_composite(atlas)
    bg.convert('RGB').save(p)
    print('preview', p)
