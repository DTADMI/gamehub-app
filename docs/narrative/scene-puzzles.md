# Narrative — Scene & Puzzle Briefs (TME E1 focus)

This document captures the cleverness pass for Toymaker Escape — Episode 1 (TME E1). It describes scenes, environment
storytelling, puzzle beats, diegetic clues, accessibility notes, and asset lists for designers/illustrators and audio.

Status: Draft (approved plan). Languages: EN/FR copy planned; placeholders below indicate where localized strings should
appear.

---

## Scenes Overview

1) Workshop Entry

- Mood: Warm, slightly cluttered artisan workshop. Evening light, dust motes.
- Key props: Door with keypad panel; wall poster with toy silhouettes; music box on a side table; subtle scuff near a
  cabinet seam.
- Interactions:
    - Keypad gate (no inline code). Clue exists elsewhere.
    - Hidden latch (hold→drag gesture) reveals cabinet compartment later.
- Diegetic clues:
    - Poster with four toy silhouettes sized 2→4→1→3 suggests keypad order.
    - Caption alt-text references “four toys arranged unusually by size.”
- Assets needed:
    - Background plate (workshop view, keypad panel at door height). File: `tme_e1_workshop_bg_v1.png`
    - Poster art (4 toy silhouettes, subtle size coding, EN/FR caption text area). File: `tme_e1_poster_toys_v1.png`
    - Music box prop (idle + subtle animation frames optional). Files: `tme_e1_musicbox_idle_v1.png`,
      `tme_e1_musicbox_anim_v1.json`
    - Cabinet seam/scuff decal near lower right wall. File: `tme_e1_scuff_decal_v1.png`
    - SFX: soft room tone; subtle latch click; optional music box loop. Files: `sfx_room_tone_workshop_v1.ogg`,
      `sfx_latch_click_v1.ogg`, `sfx_musicbox_loop_v1.ogg`

2) Shelf Nook

- Mood: Cozy alcove with shelves of toys and parts. Warm light pools.
- Key props: Shelf with four featured toys (size/height difference noticeable); small brass plate partially worn (“3:
  1”).
- Interactions:
    - Observation event: examining shelf records blackboard flag `seen.shelf.order=true`.
    - Gear ratio hint: brass plate “3:1” partially occluded.
- Diegetic clues:
    - The vertical order of toys correlates to keypad digits.
    - The brass plate prefigures the gears ratio puzzle.
- Assets needed:
    - Background of shelf alcove with four toy variants (silhouette readability on mobile). File:
      `tme_e1_shelf_nook_bg_v1.png`
    - Brass plate with aged engraving “3:1”. File: `tme_e1_ratio_plate_3to1_v1.png`
    - EN/FR caption copy variants. Files: `tme_e1_captions_en.md`, `tme_e1_captions_fr.md`

3) Workbench

- Mood: Functional table with vices, gears, and blueprints.
- Key props: Three gears (in/idle/out) with adjustable teeth counts; blueprint sheet with a rough timing note.
- Interactions:
    - Gears mini: achieve approx 1:3 output ratio; tolerance ±0.1% (configurable).
    - Feedback: subtle change in music box tempo or highlight when solved; reduced‑motion: static outline.
- Diegetic clues:
    - Blueprint scribble hints “out slower than in” and a ratio sketch.
- Assets needed:
    - Workbench background; gear sprites with adjustable states; blueprint insert. Files: `tme_e1_workbench_bg_v1.png`,
      `tme_e1_gears_sprite_v1.png`, `tme_e1_blueprint_insert_v1.png`
    - SFX: gentle confirm chime; optional ticking variant. Files: `sfx_confirm_soft_v1.ogg`, `sfx_tick_soft_v1.ogg`

4) Cabinet Wall

- Mood: Paneled wall with a service panel (pipes) and a wiring board below.
- Key props: Pipe grid with elbow/straight/tee/cross pieces and a valve; wiring board with colored jacks.
- Interactions:
    - Pipes/flow: rotate tiles to connect source→sink without open ends; valve must be open. Reduced‑motion: solved path
      highlight only.
    - Wires/connectors: map pairs without crossings (poster in Entry hints “No crossings”).
    - Hidden latch: requires `long‑press → drag` gesture on scuffed area to reveal.
- Diegetic clues:
    - Hissing audio near a misaligned elbow; dampness decal nearby.
    - Poster icon (from Entry) reiterates non‑crossing mapping.
- Assets needed:
    - Cabinet wall background; pipe grid artwork; valve (open/closed states); wiring board with colored jacks and cords.
      Files: `tme_e1_cabinet_wall_bg_v1.png`, `tme_e1_pipe_grid_v1.png`, `tme_e1_valve_states_v1.png`,
      `tme_e1_wiring_board_v1.png`, `tme_e1_wires_cords_v1.png`
    - Decals: damp stain; tiny scuff; poster icon. Files: `tme_e1_damp_decal_v1.png`, `tme_e1_scuff_small_v1.png`,
      `tme_e1_icon_no_cross_v1.png`
    - SFX: short hiss loop localized; latch click. Files: `sfx_hiss_loop_v1.ogg`, `sfx_latch_click_v1.ogg`

---

## Puzzle Specs (logic-level)

Keypad

- UI: numeric keypad; UI must not expose the code.
- Clue: deduce 2‑4‑1‑3 from Shelf Nook props or Entry poster.
- Acceptance: existing keypad primitive; unchanged logic; scene text and captions updated to remove inline code.

Gears Ratio Mesh

- Target: output ≈ input/3 with direction considered.
- Logic: use `libs/shared/src/pointclick/puzzles/gears.ts` evaluator; add tolerance.
- A11y: When solved, indicate via non‑animated highlight and caption text.

Wires/Connectors

- Rule: pair endpoints without any line crossings; optional pairing order from subtle lighting sequence.
- Logic: `libs/shared/src/pointclick/puzzles/wires.ts` no‑crossings constraint; negative cases produce safe feedback.

Pipes/Flow

- Grid: straight, elbow, tee, cross, endcap, valve. All sinks must connect to a source; no open ends; valve must be
  open.
- Logic: implement in `pointclick/puzzles/pipes.ts` (planned); provide reduced‑motion visual state.

Gesture Macro — Hidden Latch

- Macro: `['pointerdown','longpress','swipe']`.
- Trigger area: scuffed cabinet seam; on match, set blackboard `latch.revealed=true`.
- Feedback: subtle panel slide SFX; reduced‑motion: instant state change with outline.

---

## Accessibility & Localization

- EN/FR copy for posters and caption text; alt text must encode the same clues present visually.
- Reduced‑motion: replace any animated flow/tick with static highlights and textual confirmation.
- Keyboard navigation: hotspots reachable; Inventory and Dialogue remain fully accessible.

---

## Asset List (initial)

Illustration/UI

- 4 scene backgrounds: Entry, Shelf Nook, Workbench, Cabinet Wall.
- Props: Keypad panel, poster (toy silhouettes), brass ratio plate “3:1”, music box, wiring board, pipe grid, valve,
  damp stain decal, scuff decal.
- Icons: “No crossings” symbol.
- Filenames reference: see per‑scene lists above; follow `tme_e1_<object>_<detail>_v<NN>.<ext>` convention.

Audio

- Room tone loop (light workshop ambience).
- Music box motif (idle + solved variant, subtle).
- Hiss loop (localized near leak) and latch click.
- Filenames reference: `sfx_*_v<NN>.(ogg|mp3)`.

Copy (EN/FR)

- Poster captions; descriptive alt text for toys order; blueprint hint text; valve instruction short line.
- Store strings in `i18n/toymaker-escape/{en.json,fr.json}` under keys `tme.e1.*`.

### Asset naming convention

- Images: `tme_e1_<location|object>_<detail>_v1.png` (PNG for UI/illustration; SVG when appropriate for icons)
- Audio: `sfx_<short_desc>_v1.ogg`
- Animation/atlas: `tme_e1_<object>_anim_v1.json`

Notes

- All assets must be readable at mobile scale; use high contrast for clues without breaking the diegetic feel.
