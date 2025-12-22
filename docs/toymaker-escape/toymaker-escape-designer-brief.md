# Toymaker Escape — Designer/Animator Brief (EN)

This brief specifies the visual and motion deliverables for the episodic point‑and‑click “Toymaker Escape.” It mirrors
our standard: formats, sizes, naming, budgets, and PR hand‑off checklist to enable smooth integration.

Links

- Design doc: docs/toymaker-escape/toymaker-escape-design.md
- Stories tracker: docs/toymaker-escape/toymaker-escape-stories.md

Key principles

- Tone: clever, cozy, never cruel. Whimsy without horror. The “kidnap” premise is framed as a consensual game between
  adults.
- Accessibility: large targets, clear focus, readable contrast, captions for SFX/music, reduced‑motion stills.
- Performance: SVG and AVIF preferred; hit budgets.

Formats, sizes, naming, delivery

- Backgrounds: AVIF (preferred) + WEBP fallback; 2560×1440 and 1920×1080. Names: `e<NUM>_<room>_bg.avif` (e.g.,
  `e1_workshop_bg.avif`).
- Props/hotspots: SVG (clean paths; no embedded rasters) or transparent PNG 2×. Names: `e<NUM>_<room>_<prop>.svg`.
- UI overlays: SVG. Names: `ui_<scope>_<name>.svg` (e.g., `ui_inventory.svg`, `ui_medal_panel.svg`).
- Badges/collectibles: SVG + 256×256 PNG fallback. Names: `badge_<id>.svg`, `collect_<id>.svg`.
- Motion loops: subtle ≤ 6s; ≤ 200KB after brotli; must have reduced‑motion stills.
- Delivery path: `public/games/toymaker-escape/assets/{e1|e2|e3|shared}/`.
- Budgets (targets, post‑brotli): ≤ 900KB per episode aggregate; ≤ 30KB per SVG; ≤ 200KB per loop.

Definition of Done (DoD)

- BGs delivered in two sizes/codecs with 5% safe margins.
- Props as individual SVGs; hotspot elements separate; no stray IDs/classes unless required.
- Overlays legible static; loops have stills and do not gate comprehension.
- Annotated PNG per room: hotspot rectangles (percent), tab order hints, and puzzle affordances.
- Names/paths per spec; budgets verified; PR links corresponding stories entry and marks status.

Episode E1 — Workshop & Playroom (asset templates)

- Intro/Outro (title cards)
-
  - No new illustration assets required for `TME_INTRO`/`TME_OUTRO` (text‑first title cards). Reuse existing UI styles;
    ensure readable headings and buttons with visible focus. Copy keys live under `tme.intro2.*` and `tme.outro.*`.

- Workshop BG: `e1_workshop_bg.avif`; Playroom BG: `e1_playroom_bg.avif`.
- Props (Workshop): `e1_workshop_gears_[1..6].svg`, `e1_workshop_crank.svg`, `e1_workshop_musicbox.svg`,
  `e1_workshop_plate.svg` (gear mount).
- Props (Playroom): `e1_playroom_sorter_slot_[1..4].svg`, `e1_playroom_toy_[1..6].svg`,
  `e1_playroom_color_chip_[r|g|b|y].svg`.
- UI overlays: `ui_gear_grid.svg`, `ui_sorter_bins.svg`.
- Collectibles/Badges: `collect_key_fragment_1.svg`, `badge_escape_novice.svg`.

Episode E2 — Office & Secret Stair (asset templates)

- BG: `e2_office_bg.avif`, `e2_files_bg.avif`, `e2_stair_bg.avif`.
- Props: `e2_office_cipher_wheel.svg`, `e2_office_letter_[1..4].svg`, `e2_files_folder_[a..d].svg`,
  `e2_stair_shadow_card_[1..3].svg`.
- UI: `ui_cipher_overlay.svg`, `ui_file_order.svg`, `ui_shadow_safe.svg`.
- Collectibles: `collect_key_fragment_2.svg`.

Episode E3 — Apartment Mystery (asset templates)

- BG: `e3_entry_bg.avif`, `e3_living_bg.avif`, `e3_study_bg.avif`, `e3_kitchen_bg.avif`.
- Props: `e3_plants_schedule.svg`, `e3_photo_tile_[1..9].svg`, `e3_fridge_letter_[a..z].svg`.
- UI: `ui_memory_wall.svg`, `ui_anagram_board.svg`.
- Collectibles/Badges: `collect_key_fragment_3.svg`, `badge_truth_seeker.svg`.

Global UI assets

- `ui_inventory.svg`, `ui_codex_tabs.svg`, `ui_medal_panel.svg`, `ui_hint_toggle.svg`.

Hand‑off workflow & PR checklist

1) Deliver BGs (both sizes/codecs), props SVGs, overlays, optional loops + stills, annotated PNG(s), palette notes.
2) We integrate and provide a capture; iterate ≤ 2 cycles where possible.
3) PR checklist (paste into description):

- [ ] Backgrounds (2560×1440 + 1920×1080) AVIF + WEBP
- [ ] Props SVGs (clean paths; separate hotspot layers)
- [ ] Badge/collectibles
- [ ] Optional loops + reduced‑motion stills
- [ ] Annotated PNG with hotspot rectangles and puzzle affordances
- [ ] Names/paths per spec; budgets verified
- [ ] Linked to `docs/toymaker-escape/toymaker-escape-stories.md` entry; status updated

— — —

# Toymaker Escape — Cahier Designer/Animateur·rice (FR)

Ce cahier définit les livrables visuels/motion pour « Toymaker Escape » : formats, tailles, nommage, budgets et
checklist PR pour une intégration fluide.

Liens

- Doc de conception : docs/toymaker-escape/toymaker-escape-design.md
- Suivi des histoires : docs/toymaker-escape/toymaker-escape-stories.md

Principes

- Ton : astucieux, cosy, jamais cruel. Aucune horreur. La « mise en scène » d’enlèvement est un jeu consenti entre
  adultes.
- Accessibilité : grandes cibles, focus visible, contraste lisible, sous‑titres pour SFX/musique, alternatives sans
  animation.
- Performance : SVG/AVIF privilégiés; budgets respectés.

Formats, tailles, nommage, livraison

- BG : AVIF + WEBP; 2560×1440 et 1920×1080. `e<NUM>_<room>_bg.avif`.
- Props : SVG/PNG 2×. `e<NUM>_<room>_<prop>.svg`.
- Overlays UI : `ui_<scope>_<nom>.svg`.
- Badges/collectors : SVG + PNG 256×256 secours.
- Boucles : ≤ 6s; ≤ 200KB; avec statiques.
- Dossier : `public/games/toymaker-escape/assets/{e1|e2|e3|shared}/`.
- Budgets : ≤ 900KB/épisode; ≤ 30KB/SVG; ≤ 200KB/boucle.

Définition de Fini

- BGs en deux tailles/codecs; marges 5%.
- Props SVG séparés; hotspots dédiés; IDs/classes nettoyés.
- Overlays lisibles sans animation; statiques fournies.
- PNG annoté (rectangles %, ordre de tabulation, affordances).
- Noms/chemins conformes; budgets OK; PR liée à l’entrée du suivi des histoires.

Gabarits d’assets par épisode

- E1/E2/E3 : identiques aux sections EN ci‑dessus (BG, props, overlays, badges/collectors).

Workflow & Checklist PR

1) Livraison BGs/props/overlays/boucles + statiques/PNG annoté/notes de palette.
2) Intégration + capture; ≤ 2 itérations.
3) Checklist PR : identique à la section EN.
