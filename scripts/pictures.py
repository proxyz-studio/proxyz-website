#!/usr/bin/env python3
"""Turn the source drawings (PNG) into the web pictures the film reads.

Usage:
  python3 scripts/pictures.py <source-folder> [--prefer <folder>]... [--only key,key]

  <source-folder>  the folder the paths in pictures/sources.json are relative to.
  --prefer <dir>   look here first for a bigger drawing of the same picture (same file name as in
                   sources.json, or <key>.png). It is used only when it is a PNG with the same shape and
                   at least the 1x width. If <dir>/manifest.json exists, a file is used only when the
                   manifest names it (so half drawn pictures are never taken). Repeatable.
  --only           re-encode only these keys (the others keep their current files).

For every picture it writes, into public/pictures/:
  <key>-<width>.<hash>.webp (and .avif when that is smaller)   at 1x (desktop 1440 wide, phone 786 wide)
  and the same at 2x (2880, 1572) when the source is at least that big.
and it writes src/generated/pictures.json, which the film and the pages read.

Always encode from the final PNG (with grain), never from a JPG or WebP.
Needs only Python 3 and Pillow with AVIF and WebP (checked at start).
"""
import hashlib
import io
import json
import pathlib
import sys

from PIL import Image, features

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCES = ROOT / "pictures" / "sources.json"
OUT_DIR = ROOT / "public" / "pictures"
MANIFEST = ROOT / "src" / "generated" / "pictures.json"
LOGICAL = {"desk": (1440, 900), "phone": (786, 1704)}
# Dark pictures band easily. These settings were chosen by looking at the dark floors brightened 6 to 12 times:
# AVIF with full colour detail (4:4:4) keeps the black neutral (4:2:0 tinted it green).
AVIF = dict(quality=84, subsampling="4:4:4", speed=4)
WEBP = dict(quality=86, method=6)


def fail(msg):
    raise SystemExit("pictures: " + msg)


def form_of(key):
    for f in LOGICAL:
        if f"-{f}-" in key:
            return f
    fail(f"cannot tell desk or phone from the key {key}")


def listed_in_manifest(folder, name):
    m = folder / "manifest.json"
    if not m.exists():
        return True
    return name in m.read_text(encoding="utf-8")


def pick_source(key, rel, root, prefer):
    lw, lh = LOGICAL[form_of(key)]
    for folder in prefer:
        for name in (pathlib.Path(rel).name, key + ".png"):
            p = folder / name
            if p.exists() and listed_in_manifest(folder, name):
                with Image.open(p) as im:
                    w, h = im.size
                if abs(w / h - lw / lh) < 0.005 and w >= lw:
                    return p
    p = root / rel
    if not p.exists():
        fail(f"missing source for {key}: {rel}")
    return p


def encode(im, fmt, opts):
    b = io.BytesIO()
    # a fresh image: no text chunks, colour profiles or other metadata are carried into the web file
    clean = Image.new("RGB", im.size)
    clean.paste(im)
    clean.save(b, fmt, **opts)
    return b.getvalue()


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
    sources = {k: v for k, v in json.loads(SOURCES.read_text()).items() if not k.startswith("_")}
    old = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest, keep = {}, set()
    for key, rel in sources.items():
        lw, lh = LOGICAL[form_of(key)]
        if only is not None and key not in only and key in old:
            manifest[key] = old[key]
            keep.update(pathlib.Path(f[x]).name for f in old[key]["files"] for x in ("avif", "webp") if x in f)
            continue
        src = pick_source(key, rel, root, prefer)
        with Image.open(src) as im:
            im = im.convert("RGB")
            w, h = im.size
            if abs(w / h - lw / lh) > 0.005:
                fail(f"{key}: shape {w}x{h} does not match {lw}x{lh}")
            files = []
            for scale in (1, 2):
                tw, th = lw * scale, lh * scale
                if w < tw:
                    break
                sized = im if (w, h) == (tw, th) else im.resize((tw, th), Image.LANCZOS)
                entry = {"w": tw}
                data = {"avif": encode(sized, "AVIF", AVIF), "webp": encode(sized, "WEBP", WEBP)}
                # AVIF is offered first only when it is really smaller; on grainy pictures at this quality
                # it can be bigger than WebP, and then it would only cost the visitor more.
                if len(data["avif"]) > 0.95 * len(data["webp"]):
                    del data["avif"]
                for ext, blob in data.items():
                    name = f"{key}-{tw}.{hashlib.sha256(blob).hexdigest()[:10]}.{ext}"
                    (OUT_DIR / name).write_bytes(blob)
                    keep.add(name)
                    entry[ext] = "/pictures/" + name
                    entry[ext + "Bytes"] = len(blob)
                files.append(entry)
        manifest[key] = {"size": [lw, lh], "files": files}
        print(f"{key}: {src.name} {w}x{h} -> " + ", ".join(f"{f['w']}w " + " ".join(f"{x} {f[x + 'Bytes'] // 1024} KB" for x in ("avif", "webp") if x in f) for f in files))
    # remove web pictures this script wrote earlier that are no longer named in the manifest
    for p in OUT_DIR.iterdir():
        if p.suffix in (".avif", ".webp") and p.name not in keep:
            p.unlink()
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(manifest, indent=1) + "\n")
    total = sum(f[x] for v in manifest.values() for f in v["files"] for x in ("avifBytes", "webpBytes") if x in f)
    print(f"wrote {MANIFEST.relative_to(ROOT)}: {len(manifest)} pictures, {total // 1024} KB of web files")


if __name__ == "__main__":
    main(sys.argv[1:])
