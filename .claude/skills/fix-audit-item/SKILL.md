---
name: fix-audit-item
description: Work through Waken's pre-early-access audit (AUDIT.md) one finding at a time. Picks an open finding by ID (S0.1 to S7.n) or the most severe open one, re-checks it against the current code, finds which other open findings share its files, proposes a fix and waits for Felix's approval, then implements, verifies, commits and marks the finding done. Covers code fixes, design decisions, dialogue, art and sound (with a searchable index of the 3,000-file private sound library). Use whenever the user says "fix S2.4", "next audit item", "work on the audit", mentions a finding from AUDIT.md, or asks to find a sound for something.
---

# Fixing one audit finding

`AUDIT.md` is both the report and the tracker. Every finding has a permanent ID
(`S<section>.<n>`, section 0 is the "Fix first" table) and a status:

| Mark | Meaning |
|---|---|
| `☐` | open |
| `◐ 2026-11-08` | claimed by a session on that date |
| `✅ a1b2c3d` | done in that commit |
| `✖ reason` | won't fix, with Felix's reason |

IDs are never renumbered or reused. Line references in the audit were right on
7.11.2026 and drift as fixes land: always re-locate the code.

**This skill overrides "Guide, don't implement" in CLAUDE.md.** Felix has asked
for these fixes to be implemented by you, *after* he approves the proposal. Every
other rule in CLAUDE.md and in memory still applies (no comments, no `any`,
handlers as plain objects, performance first, no unsolicited refactors).

## 1. Pick and claim

- If the user named an ID, take it. Otherwise take the first `☐` in section 0,
  then the most severe `☐` in sections 1–7 (🟥, then 🟧, then 🟨, then ⬜), in
  file order.
- Skip `◐` items. A claim older than two days with nothing in `git log --grep "<ID>"`
  may be stale: ask before taking it.
- Claim at once: change `☐` to `◐ <today>` in AUDIT.md. Other sessions may be
  working in the same checkout, and this is how they avoid you.

```sh
grep -n '☐' AUDIT.md | head -20              # open items in order
grep -n '`S2.14`\|| S0.14 |' AUDIT.md        # one item
grep -c '☐' AUDIT.md                         # how many are left
```

## 2. Re-check the finding

Read the code the finding cites. Confirm it is still true and find where it lives
now. If it is already fixed or wrong, say so with evidence and propose `✖` or
`✅` (no commit needed). Don't propose a fix for a finding you haven't reproduced
in the code.

## 3. Find overlapping findings

Before designing anything, list every file and symbol the fix will touch, then
search the audit for each:

```sh
grep -n 'Pickable\|entity.ts\|INVENTORY_SYNC' AUDIT.md | grep -v '✅\|✖'
```

For each open finding that comes up, decide which of these applies and say so in
the proposal:

- **Untouched**: it shares the file but not the code path.
- **Kept fixable**: the fix touches its code; explain why it doesn't make that
  finding harder to fix later. For example, don't hard-code a sound call where the
  pickup toast (S1.1) will need a hook.
- **Covered**: the fix would naturally fix it too. Propose doing both, but only
  with approval. Never fix a neighbouring finding silently.
- **Conflicts**: the two need opposite designs. Stop and ask which comes first.

Also check `git status`: if another session has uncommitted changes in the same
files, say so and leave those hunks alone.

## 4. Propose and stop

Post the proposal and **wait for approval**. Don't edit code before Felix answers.

```
S1.5 🟧 Inventory full on pickup is silent; pickup is all-or-nothing

Still true: entity.ts:141 returns early when ... (Pickable.ts:61 already removed it locally)

Fix:
  1. ...
  2. ...
Files: server/src/handlers/entity.ts, client/src/components/Pickable.ts
Persistence: none / saved in save.ts and restored in load.ts (same change)
Overlaps:
  S1.1 pickup toast: kept fixable, the partial-pickup result goes through ...
  S1.8 local removal before confirm: covered, same code path; propose doing both?
  S2.28 PICKUP sound before confirm: untouched
Check: typecheck, server tests, a new test for partial pickup, in game: fill 18 slots, pick up a stack of 5
```

Keep it short. If there are real alternatives, give a recommendation plus at most
one alternative. If a finding is too broad for one change (most bullets in "Silent
actions", the god-file splits, the `any` sweeps), propose splitting it into parts
`S2.21a`, `S2.21b`, ... written as nested bullets under the parent. The parent
stays `◐` until every part is done.

### Findings that aren't code fixes

- **Design decisions** (offline mode, licensing, rebinding layout, tutorial,
  needs as a sink, unique equipment): lay out 2–3 options with costs and a
  recommendation. Implement only once Felix picks one.
- **Dialogue and story** (most of section 3 "Dialogue"): Felix writes these.
  You may draft lines as proposals in chat; nothing enters configs unreviewed.
  When reviewing, render the line, its replies and the answer per mood or
  condition, and read it as a player would.
- **Economy and progression**: the tier rules in memory apply (tier follows
  first availability, one meat per tier). Run `npm run simulate:economy` before
  and after.
- **Art**: use the matching skill: `sprite-variants`, `robes`, `new-entity`,
  `tiled`, `spell-vfx`. Render a preview into `previews/audit/<ID>/` and link it
  with a relative path. Keep effects understated, refine within the current
  approach, and make variants with small added details rather than recolours.
- **Sound**: see below.

## 5. Implement

After approval, do exactly what was approved. If you find you need to deviate,
stop and say why before going on.

- Persistence goes in the same change: new state is saved and loaded.
- A repeated config mistake means the format is wrong: fix the engine and add a
  verifier rule (section 3 lists suggested rules).
- Changes to pathing: keep PATH_MARGIN ≥ PATH_ARRIVAL and simulate routes.
- Don't regenerate a map Felix has hand-edited; patch only the cells you need.
- After editing a .tmx, export it to JSON and run `verify:maps` (`tiled` skill).

## 6. Verify

Run what applies and report results honestly, including failures you didn't cause:

```sh
npm run typecheck
npm test
npm run verify:story
npm run verify:maps
/usr/bin/python3 scripts/sheets.py verify   # Homebrew python3 has no Pillow
/usr/bin/python3 scripts/tiles.py verify
```

`verify:maps` failed at audit time because of the unexported generated maps
(S6.12): don't count that against your change. Add a test for server logic
(`server/src/**/*.test.ts`). For anything you can see or hear, say what Felix
should try in game, or use the `run` skill.

## 7. Close

1. In AUDIT.md, change the item's mark to `✅ <short hash>` after committing (or
   commit, then amend the hash in with the next item; either is fine as long as
   the hash is right). Use `✖ <reason>` if Felix decided against it.
2. If the fix changed what an overlapping finding says (a line moved, half of it
   is now fixed), update that finding's wording. Don't mark it done.
3. Commit only the files for this item, plus AUDIT.md. Never `git add -A`; other
   sessions may have work in progress. Message style matches the repo, with the
   ID first:

   ```
   S1.5: Partial pickup and inventory-full feedback
   ```

   Never push.
4. Give a short summary: what changed, checks run, what to try in game, and the
   next open item.

Don't write follow-ups into the DEVLOG backlog. If you find a new problem, tell
Felix; add it to AUDIT.md as a new ID at the end of its section only if he agrees.

## Sound

The private library is `/Users/felixoconnor/Documents/private/sprites/sounds`
(about 3,000 files in wav, ogg and mp3, 1.3 GB, organised by pack). Don't browse
it with `ls`. Search the index:

```sh
S=.claude/skills/fix-audit-item/scripts/sounds.py
python3 $S find crow --max-dur 3                    # library: path terms are ANDed
python3 $S find creatures growl --exclude loop --mono
python3 $S find bite --index game                   # what the game ships now
cut -f2 .claude/skills/fix-audit-item/sounds/library.tsv | sort | uniq -c   # packs
python3 $S index --full                              # re-probe everything (rarely needed)
```

Output columns: duration (s), channels, sample rate, peak dBFS, mean dB, path.
The index lives in `.claude/skills/fix-audit-item/sounds/` (`library.tsv`,
`game.tsv`). It stays current by itself: every `find` checks modification times,
probes only new or changed files and drops deleted ones, so new packs in the
library and new sounds in the game show up without being mentioned. A changed
`game.tsv` or `library.tsv` goes into the item's commit. Archives (zip, rar) aren't
indexed; they're listed in `library.archives.txt`. If a pack looks promising,
extract it next to the archive in the library folder, so it's indexed from then on.

Workflow:

1. **Check the game first.** The right sound may already ship, unused or loaded
   but never played (`absorb_life.ogg`, `fire_wave.ogg`).
2. **Search the library** with several synonyms (a rooster: `rooster`, `crow`,
   `cock`, `chicken`). Search by pack too: `Animals Sound Effects`,
   `Fantasy SFX Pack`, `monster`, `jute-dh-rpgsounds`, `creatures`.
3. **Shortlist 2–4 candidates.** Prefer short, mono files for positional SFX, and
   several variants for frequent actions (the audit flags single-variant sounds).
   Compare mean dB against the sounds it plays next to in `game.tsv`; the audit
   flags 10 dB gaps within sets.
4. **Make them listenable.** Copy them into `previews/audit/<ID>/` and link them
   relatively. If the level differs, render a level-matched copy with `ffmpeg` too.
5. **Note the source pack and its licence.** Look for a licence or readme file in
   the pack folder. S7 asks for licence records for every third-party pack, so put
   the pack name in the proposal.
6. **After approval:** convert to `.ogg` (mono for positional SFX, trimmed tails),
   place it in `client/public/assets/sounds/<folder>/`, and register it in
   `server/src/configs/sounds.ts` (`SoundName` in `server/src/types/sounds.ts`;
   the `new-entity` skill covers entity voices).

Never pick a sound without listening being possible: Felix decides by ear, so the
preview is the proposal.
