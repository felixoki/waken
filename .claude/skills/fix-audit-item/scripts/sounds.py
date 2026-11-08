#!/usr/bin/env python3
import argparse
import csv
import json
import os
import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

LIBRARY = "/Users/felixoconnor/Documents/private/sprites/sounds"
GAME = "client/public/assets/sounds"
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), "sounds")
EXTS = {".wav", ".ogg", ".mp3", ".flac", ".m4a", ".aif", ".aiff"}
COLS = ["path", "pack", "ext", "codec", "dur", "ch", "rate", "peak_db", "mean_db"]


def probe(root, rel):
    full = os.path.join(root, rel)
    parts = rel.split(os.sep)
    pack = parts[1] if parts[0] == "packs" and len(parts) > 2 else parts[0]
    row = {"path": rel, "pack": pack, "ext": os.path.splitext(rel)[1][1:].lower()}
    try:
        info = json.loads(subprocess.run(
            ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_streams", "-show_format", full],
            capture_output=True, text=True, timeout=60).stdout or "{}")
        s = next((x for x in info.get("streams", []) if x.get("codec_type") == "audio"), {})
        row["codec"] = s.get("codec_name", "")
        row["dur"] = f"{float(info.get('format', {}).get('duration', 0) or 0):.2f}"
        row["ch"] = str(s.get("channels", ""))
        row["rate"] = str(s.get("sample_rate", ""))
        vd = subprocess.run(
            ["ffmpeg", "-hide_banner", "-nostats", "-i", full, "-af", "volumedetect", "-f", "null", "-"],
            capture_output=True, text=True, timeout=300).stderr
        mx = re.search(r"max_volume: (-?[\d.]+|-inf) dB", vd)
        mn = re.search(r"mean_volume: (-?[\d.]+|-inf) dB", vd)
        row["peak_db"] = mx.group(1) if mx else ""
        row["mean_db"] = mn.group(1) if mn else ""
    except Exception:
        pass
    return {c: row.get(c, "") for c in COLS}


def build(root, name, jobs):
    rels = []
    skipped = []
    for d, _, files in os.walk(root):
        for f in files:
            rel = os.path.relpath(os.path.join(d, f), root)
            ext = os.path.splitext(f)[1].lower()
            if ext in EXTS:
                rels.append(rel)
            elif ext in {".zip", ".rar", ".7z"}:
                skipped.append(rel)
    rels.sort()
    with ThreadPoolExecutor(jobs) as ex:
        rows = list(ex.map(lambda r: probe(root, r), rels))
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, f"{name}.tsv")
    with open(path, "w", newline="") as fh:
        w = csv.DictWriter(fh, COLS, delimiter="\t")
        w.writeheader()
        w.writerows(rows)
    if skipped:
        with open(os.path.join(OUT, f"{name}.archives.txt"), "w") as fh:
            fh.write("\n".join(sorted(skipped)) + "\n")
    print(f"{path}: {len(rows)} files, {len(skipped)} archives not indexed")


def num(v, default):
    try:
        return float(v)
    except ValueError:
        return default


def find(args):
    path = os.path.join(OUT, f"{args.index}.tsv")
    if not os.path.exists(path):
        sys.exit(f"{path} missing: run `sounds.py index` first")
    terms = [t.lower() for t in args.terms]
    with open(path) as fh:
        rows = list(csv.DictReader(fh, delimiter="\t"))
    hits = []
    for r in rows:
        p = r["path"].lower()
        if any(t not in p for t in terms):
            continue
        if args.exclude and any(x.lower() in p for x in args.exclude):
            continue
        d = num(r["dur"], 0)
        if args.min_dur is not None and d < args.min_dur:
            continue
        if args.max_dur is not None and d > args.max_dur:
            continue
        if args.mono and r["ch"] != "1":
            continue
        hits.append(r)
    for r in hits[: args.limit]:
        print("\t".join(r[c] for c in ["dur", "ch", "rate", "peak_db", "mean_db", "path"]))
    print(f"-- {len(hits)} match{'es' if len(hits) != 1 else ''}" + (f", showing {args.limit}" if len(hits) > args.limit else ""), file=sys.stderr)


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    ix = sub.add_parser("index")
    ix.add_argument("which", choices=["library", "game", "all"], nargs="?", default="all")
    ix.add_argument("--jobs", type=int, default=8)
    fd = sub.add_parser("find")
    fd.add_argument("terms", nargs="*")
    fd.add_argument("--index", choices=["library", "game"], default="library")
    fd.add_argument("--exclude", nargs="*")
    fd.add_argument("--min-dur", type=float)
    fd.add_argument("--max-dur", type=float)
    fd.add_argument("--mono", action="store_true")
    fd.add_argument("--limit", type=int, default=40)
    a = ap.parse_args()
    if a.cmd == "index":
        if a.which in ("library", "all"):
            build(LIBRARY, "library", a.jobs)
        if a.which in ("game", "all"):
            build(GAME, "game", a.jobs)
    else:
        find(a)


if __name__ == "__main__":
    main()
