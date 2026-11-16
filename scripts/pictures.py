#!/usr/bin/env python3
"""Turn the source drawings (PNG) into the web pictures the film reads.

Usage:
  python3 scripts/pictures.py <source-folder> [--prefer <folder>]... [--only key,key]

  <source-folder>  the folder the paths in pictures/sources.json are relative to.
  --prefer <dir>   a folder of the same drawings at twice the size. For the drawing out2/s1-desk-p1.png it looks for
                   <dir>/s1-desk-p1@2x.png (or <dir>/s1-desk-p1.png); for out5/s2v2-desk-p1@1x.png it looks for
                   <dir>/s2v2-desk-p1@2x.png. The bigger drawing is used only when it is a PNG
                   of the same shape and at least twice the 1x width, and, when <dir>/manifest.json exists, only when
                   the manifest's own entry for that file says "status": "done" (so half drawn pictures are never
                   taken). Repeatable.
  --only           re-encode only these keys (the others keep their current files).

For every picture it writes, into public/pictures/:
  <key>-<width>.<hash>.avif and .webp   at 1x (desktop 1440 wide, phone 786 wide)
  and the same at 2x (2880, 1572) when a drawing that big exists.
and it writes src/generated/pictures.json, which the film and the pages read.

The 1x file is made from the 1x drawing named in sources.json (when that drawing is itself 2x, it is halved).
The 2x file is made from the bigger drawing. Neither is ever made from a JPG or WebP.

Mattes: a picture in sources.json with "matte": true is the matte of the thing a scene lights first (a PNG with
alpha, white thing on transparent, framed exactly like that scene's pictures). It becomes a small WebP with the same
alpha (white, so only the alpha counts) at 1x and, when a bigger matte exists, 2x, and its manifest entry says
"matte": true. The film uses a matte only when the scene's view names it and the manifest holds it.

Quality: AVIF first (full colour detail 4:4:4, which keeps the black neutral, and the encoder's tuning for still
pictures, which keeps the grain), WebP as the fallback. Chosen by looking at the dark floors brightened 4 to 12 times at
full size: at Q_AVIF the lit floors keep their grain; the flat black floor is first set to pure black (see
flatten_black), so it stays clean instead of showing blotches. The script prints how much of the drawing's fine grain
each file keeps on the dark floor. A picture in sources.json may set its own "q", a byte budget for its 2x file
("max2x": bytes, then the best quality that fits), or "only1x": true (no 2x file: for smooth pictures with no detail).

Needs only Python 3 and Pillow with AVIF and WebP (checked at start).
"""
import hashlib
import io
import json
import pathlib
import sys

from PIL import Image, ImageChops, ImageFilter, ImageStat, features

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCES = ROOT / "pictures" / "sources.json"
OUT_DIR = ROOT / "public" / "pictures"
MANIFEST = ROOT / "src" / "generated" / "pictures.json"
LOGICAL = {"desk": (1440, 900), "phone": (786, 1704)}
AVIF = dict(subsampling="4:4:4", speed=4, advanced={"tune": "iq"})
Q_AVIF = 70
WEBP = dict(quality=86, method=6)
# a matte: the alpha kept exactly (lossless), the white colour costs next to nothing
WEBP_MATTE = dict(lossless=True, quality=100, method=6, exact=False)


def fail(msg):
    raise SystemExit("pictures: " + msg)


def form_of(key):
    for f in LOGICAL:
        if f"-{f}-" in key:
            return f
    fail(f"cannot tell desk or phone from the key {key}")


def bigger_drawing(rel, prefer, lw, lh):
    """The 2x drawing of the 1x drawing rel, or None. Says why when it skips one. A drawing named <name>@1x.png has its
    bigger twin at <name>@2x.png; a manifest may name an entry with or without the @2x (its mattes too)."""
    stem = pathlib.Path(rel).stem
    base = stem[:-3] if stem.endswith("@1x") else stem
    for folder in prefer:
        entries = None
        m = folder / "manifest.json"
        if m.exists():
            data = json.loads(m.read_text(encoding="utf-8"))
            entries = {e.get("name"): e for e in data.get("pictures", []) + data.get("mattes", [])}
        for name in dict.fromkeys((base + "@2x", stem + "@2x", stem)):
            p = folder / (name + ".png")
            if not p.exists() or (p.name == pathlib.Path(rel).name and name.endswith("@1x")):
                continue
            if entries is not None:
                e = entries.get(name) or entries.get(base)
                if not e or e.get("status") != "done":
                    print(f"  skip {p.name}: not marked done in {m.name}")
                    continue
                small = e.get("sourceSmall")
                if small and not str(small).endswith(rel):
                    print(f"  skip {p.name}: its manifest entry belongs to another drawing")
                    continue
            with Image.open(p) as im:
                w, h = im.size
            if abs(w / h - lw / lh) < 0.005 and w >= 2 * lw:
                return p
            print(f"  skip {p.name}: {w}x{h} is not twice {lw}x{lh}")
    return None


def grain(im, mask):
    g = im.convert("L")
    return ImageStat.Stat(ImageChops.difference(g, g.filter(ImageFilter.GaussianBlur(1.2))), mask).stddev[0]


def flatten_black(im):
    """The flat black floor carries the drawing's grain as values of 0 to 2 out of 255. No encoder keeps that grain;
    instead it draws it as faint blotches that show on a bright screen. Where a 3 px blur of the picture reads 0 or 1,
    the pixels are set to pure black. Elsewhere (lit floor, the soft edge of the light) nothing changes."""
    mask = im.convert("L").filter(ImageFilter.GaussianBlur(3)).point(lambda v: 255 if v <= 1 else 0)
    out = im.copy()
    out.paste((0, 0, 0), mask=mask)
    return out


def encode(im, fmt, opts):
    b = io.BytesIO()
    # a fresh image: no text chunks, colour profiles or other metadata are carried into the web file
    clean = Image.new("RGB", im.size)
    clean.paste(im)
    clean.save(b, fmt, **opts)
    return b.getvalue()


def decode(blob):
    return Image.open(io.BytesIO(blob)).convert("RGB")


def matte_files(key, one, two, lw, lh):
    """The web files of one matte: (manifest files, notes). one and two are RGBA drawings (two may be None)."""
    files, notes = [], []
    for scale, im in ((1, one), (2, two)):
        if im is None:
            continue
        tw, th = lw * scale, lh * scale
        alpha = im.getchannel("A")
        if alpha.size != (tw, th):
            alpha = alpha.reduce(alpha.width // tw) if alpha.width % tw == 0 and alpha.width // tw == alpha.height // th else alpha.resize((tw, th), Image.LANCZOS)
        if alpha.getextrema() == (0, 0):
            fail(f"{key}: the matte is empty (no thing in it)")
        white = Image.new("L", (tw, th), 255)
        out = Image.merge("RGBA", (white, white, white, alpha))
        b = io.BytesIO()
        out.save(b, "WEBP", **WEBP_MATTE)
        blob = b.getvalue()
        back = Image.open(io.BytesIO(blob)).getchannel("A")
        worst = ImageChops.difference(back, alpha).getextrema()[1]
        if worst > 1:
            fail(f"{key}: the encoded matte differs from its drawing by {worst} of 255")
        name = f"{key}-{tw}.{hashlib.sha256(blob).hexdigest()[:10]}.webp"
        (OUT_DIR / name).write_bytes(blob)
        files.append({"w": tw, "webp": "/pictures/" + name, "webpBytes": len(blob)})
        notes.append(f"{tw}w matte webp {len(blob) // 1024} KB")
    return files, notes


def best_avif(im, q=Q_AVIF, max_bytes=None):
    """(bytes, quality, grain kept on the dark floor or None) for one AVIF file."""
    if max_bytes:
        lo, hi, best = 30, 92, None
        while lo <= hi:
            mid = (lo + hi) // 2
            blob = encode(im, "AVIF", dict(AVIF, quality=mid))
            if len(blob) <= max_bytes:
                best, lo = (blob, mid), mid + 1
            else:
                hi = mid - 1
        if not best:
            fail(f"no quality fits in {max_bytes} bytes")
        blob, q = best
    else:
        blob = encode(im, "AVIF", dict(AVIF, quality=q))
    # the dark floor: dark enough to band, bright enough to carry visible grain
    mask = im.convert("L").point(lambda v: 255 if 3 <= v <= 80 else 0)
    if ImageStat.Stat(mask).mean[0] / 255 < 0.02:
        return blob, q, None
    g0 = grain(im, mask)
    return blob, q, (grain(decode(blob), mask) / g0 if g0 else None)


def main(argv):
    if not (features.check("avif") and features.check("webp")):
        fail("this Pillow cannot write AVIF and WebP")
    args, prefer, only = [], [], None
    it = iter(argv)
    for a in it:
        if a == "--prefer":
            prefer.append(pathlib.Path(next(it)).expanduser().resolve())
        elif a == "--only":
            only = set(next(it).split(","))
        else:
            args.append(a)
    if len(args) != 1:
        fail(__doc__)
    root = pathlib.Path(args[0]).expanduser().resolve()
    sources = {k: (v if isinstance(v, dict) else {"src": v}) for k, v in json.loads(SOURCES.read_text()).items() if not k.startswith("_")}
    old = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest, keep, big_count = {}, set(), 0
    for key, spec in sources.items():
        lw, lh = LOGICAL[form_of(key)]
        if only is not None and key not in only and key in old:
            manifest[key] = old[key]
            keep.update(pathlib.Path(f[x]).name for f in old[key]["files"] for x in ("avif", "webp") if x in f)
            big_count += len(old[key]["files"]) > 1
            continue
        rel = spec["src"]
        p1 = root / rel
        if not p1.exists():
            fail(f"missing source for {key}: {rel}")
        p2 = bigger_drawing(rel, prefer, lw, lh)
        if spec.get("matte"):
            with Image.open(p1) as a:
                if "A" not in a.getbands():
                    fail(f"{key}: {rel} has no alpha (a matte is white on transparent)")
                one = a.convert("RGBA")
            if abs(one.width / one.height - lw / lh) > 0.005 or one.width < lw:
                fail(f"{key}: {rel} is {one.width}x{one.height}, not the shape {lw}x{lh}")
            two = None
            if p2 is None and one.width >= 2 * lw:
                p2 = p1
            if p2 is not None:
                with Image.open(p2) as b:
                    if "A" not in b.getbands():
                        fail(f"{key}: {p2.name} has no alpha")
                    two = b.convert("RGBA")
                big_count += 1
            files, notes = matte_files(key, one, two, lw, lh)
            for f in files:
                keep.add(pathlib.Path(f["webp"]).name)
            manifest[key] = {"size": [lw, lh], "matte": True, "files": files}
            print(f"{key}: {rel}" + (f" + {p2.name}" if p2 is not None and p2 != p1 else "") + " -> " + "; ".join(notes))
            continue
        with Image.open(p1) as a:
            one = a.convert("RGB")
        if abs(one.width / one.height - lw / lh) > 0.005 or one.width < lw:
            fail(f"{key}: {rel} is {one.width}x{one.height}, not the shape {lw}x{lh}")
        if p2 is None and one.width >= 2 * lw:
            p2 = p1                      # the named drawing is itself 2x: it gives both sizes
        if spec.get("only1x"):
            p2 = None
        two = None
        if p2 is not None:
            with Image.open(p2) as b:
                two = b.convert("RGB")
            big_count += 1
        files, notes = [], []
        for scale, im in ((1, one), (2, two)):
            if im is None:
                continue
            tw, th = lw * scale, lh * scale
            sized = flatten_black(im if im.size == (tw, th) else im.resize((tw, th), Image.LANCZOS))
            avif, q, kept = best_avif(sized, spec.get("q", Q_AVIF), spec.get("max2x") if scale == 2 else None)
            data = {"avif": avif, "webp": encode(sized, "WEBP", WEBP)}
            entry = {"w": tw, "avifQ": q}
            for ext, blob in data.items():
                name = f"{key}-{tw}.{hashlib.sha256(blob).hexdigest()[:10]}.{ext}"
                (OUT_DIR / name).write_bytes(blob)
                keep.add(name)
                entry[ext] = "/pictures/" + name
                entry[ext + "Bytes"] = len(blob)
            files.append(entry)
            notes.append(f"{tw}w avif q{q} {len(avif) // 1024} KB" + (f" grain {kept:.2f}" if kept is not None else "") + f", webp {len(data['webp']) // 1024} KB")
        manifest[key] = {"size": [lw, lh], "files": files}
        src_note = rel + (f" + {p2.name} (bigger set)" if p2 is not None and p2 != p1 else " (1x only)" if p2 is None else " (2x drawing, halved for 1x)")
        print(f"{key}: {src_note} -> " + "; ".join(notes))
    # remove web pictures this script wrote earlier that are no longer named in the manifest
    for p in OUT_DIR.iterdir():
        if p.suffix in (".avif", ".webp") and p.name not in keep:
            p.unlink()
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(manifest, indent=1) + "\n")
    total = sum(f[x] for v in manifest.values() for f in v["files"] for x in ("avifBytes", "webpBytes") if x in f)
    print(f"{big_count} of {len(manifest)} pictures have a 2x file")
    print(f"wrote {MANIFEST.relative_to(ROOT)}: {len(manifest)} pictures, {total // 1024} KB of web files")


if __name__ == "__main__":
    main(sys.argv[1:])
