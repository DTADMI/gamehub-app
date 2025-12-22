# Toymaker Escape — Episodic Point-and-Click (Design Doc)

Overview

- An episodic escape/mystery game with replayable puzzles and moral, twisty stories. You awaken in a whimsical
  toymaker’s house; each episode reveals more of the why. Tone: clever, cozy, never cruel; the player is never punished
  for curiosity. No horror.

Scenarios (first three fully drafted)

- E1 House, Part 1 — Workshop & Playroom
    - Goal: learn core interactions; collect first “Key Fragments.”
    - Rooms: Workshop, Playroom hub, Locked Hall.
    - Mini-puzzles: gear alignment, color-coded toy sorter, music box combo.
    - Choice flags: `e1.path = gears|music`; `e1.helper = hints|noHints` (affects medals).
- E2 House, Part 2 — Office & Secret Stair
    - Goal: gain office access; find who hired the toymaker.
    - Rooms: Office, Files Nook, Stairwell.
    - Puzzles: correspondence cipher; filing order logic; light-and-shadow safe.
    - Choice flags: `e2.trustNote = true|false` (believe unsigned note); `e2.route = cipher|shadow`.
- E3 Apartment Mystery — The Commissioner Is… You (Twist)
    - Goal: explore your own apartment; learn you arranged the “kidnap” with your partner because of a memory condition;
      fun replay loop becomes diegetic.
    - Rooms: Entry, Living Room, Study, Kitchen.
    - Puzzles: environmental locks (plants watering schedule code), photo sequence memory wall, fridge magnet anagram.
    - Choice flags: `e3.share = partner|journal` (who to share truth with first); `e3.keepGame = yes|no` (keep the
      playful contract).

Replayability

- Medals: Bronze (complete), Silver (no hints), Gold (optional perfect path or bonus clue).
- Remix knobs: alternative clue placements; code permutations; decoy notes; seed stored for replays.
- Codex: People, Places, Artifacts; notes unlock with neutral, kind tone.

Moral & Accessibility Guardrails

- Clear opt-out of tense audio/animations; reduced-motion stills; captions for SFX/music; no jumpscares.
- “Kidnap” is framed as consensual play between adults; no violence; language stays gentle and clear.

Gameplay & UX

- Hotspots with keyboard support; clear labels; inventory of 0–6 items; drag/drop puzzle pieces.
- Dialogue choices branch flavor and flags; no dead-ends.

Stack & Architecture

- Next.js 16, React 19; route `/games/toymaker-escape`.
- Scene/room registry with transitions; reducer state; localStorage `tme:save:v1` with seed for remix.
- Audio: ambient room loops; short SFX with captions and volume control.
- i18n: EN strings first.

## Flow & Narrative Sequencing (E1 → E2 → E3)

- Episode 1 (E1): TME_INTRO (first visit only) → E1A Workshop (choose Gears or Music) → E1B Playroom Sorter → DONE →
  TME_OUTRO (first completion only)
- Episode 2 (E2): Office & Secret Stair — cipher/filing/shadow routes → DONE → E2 wrap (medal/codex)
- Episode 3 (E3): Apartment Mystery — environmental locks and choices → DONE → E3 wrap (truth framing)
- Medals & replay: medals computed per episode; from TME_OUTRO and DONE screens, offer Replay E1, Switch Workshop route,
  and Toggle hints. Future episodes follow the same pattern.

### Narrated journey (E1)

A short title card frames the escape as a playful mystery. In the Workshop, the player chooses their path: align three
gears by rotating simple dials, or tune a music box with three sliders. Either route unlocks a plate and teaches
accessible controls. In the Playroom, selecting three colors (or shapes) reveals a hidden latch to Key Fragment 1. The
DONE screen recaps the run with a medal. The first time, the Outro appears with gentle encouragement to replay: try the
other Workshop route, switch hints, or begin again. The tone stays clever and cozy, never punishing, with captions and
reduced‑motion support.

Intro/Outro Beats (implemented)

- Intro scene `TME_INTRO` (title card): sets `intro.seen=true` on first visit, then proceeds to `E1A`. Skipped on
  subsequent runs.
- Outro scene `TME_OUTRO` (after E1 DONE): shows medal recap and replay/switch‑route/toggle‑hints hooks; sets
  `outro.seen=true`. Linked from DONE.
- Replay hooks (low‑scope): restart Episode 1, start with alternate Workshop route, toggle hints for next run.

Acceptance additions (E1)

- First run shows `TME_INTRO`; subsequent runs skip intro automatically. DONE exposes link to view `TME_OUTRO` once and
  thereafter on demand.
- Flags persisted in save: `intro.seen`, `outro.seen`, existing `e1.path`, `e1.helper`, and medal calc stored at
  `medals.e1`.

Data Model (sketch)

- `EpisodeId = E1|E2|E3`
- `RoomId` per episode (Workshop, Playroom, Hall, Office, Files, Stair, Entry, Living, Study, Kitchen)
- Save:
  `{ episode, room, flags: {e1:{path,helper}, e2:{trustNote,route}, e3:{share,keepGame}}, inventory:string[], seed:number, codex:{entries:string[]}, medals:{[roomOrEpisode]: 'bronze'|'silver'|'gold'} }`

Acceptance Criteria (Docs-ready + Content stubs)

- Episodic flow E1→E2→E3 with room transitions and save/restore.
- Each episode exposes 2+ puzzle routes and medals tally; Codex updates.
- UI accessible: focus order, keyboard traversal, captions, reduced motion.

Implementation Tasks (summary)

- Scaffolding: package, route, registry, save/load, inventory and puzzle UI.
- Content: E1 gear/sorter/music box; E2 cipher/filing/shadow safe; E3 environment puzzles.
- Testing: Playwright smokes per episode; RTL for reducer, inventory, medal calc.

Suggestions — Additional Scenarios

- E4 Rooftop Observatory (tie-in with Systems: Space) — star pattern box + gentle constellation stories.
- E5 Harbor Workshop (tie-in with Systems: Ocean) — tide clock puzzle + buoy sound matcher (captioned).
- Alternate shorts: “Toy Fair Heist” (find missing prototype via logic grid), “Clockmaker’s Apprentice” (timezone
  riddles with empathy).
