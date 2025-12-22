# Systems Discovery — Designer/Animator Brief (EN)

This brief specifies visual/motion deliverables for the point‑and‑click game “Systems Discovery.” It mirrors the Rite of
Discovery brief: clear formats, sizes, naming, budgets, and a hand‑off checklist so art can be integrated smoothly.

Links

- Design doc: docs/systems-discovery/systems-discovery-design.md
- Stories tracker: docs/systems-discovery/systems-discovery-stories.md

Key principles

- Kindness-first; optimistic curiosity. No fearmongering. Avoid real brands/logos.
- Accessibility: visible hotspots, high contrast, reduced‑motion stills, captions for SFX/ambient.
- Performance: prefer SVG and AVIF; hit budgets.

File formats, sizes, naming, delivery

- Backgrounds: AVIF (preferred) + WEBP fallback; 2560×1440 and 1920×1080. `pack<CODE>_scene<ID>_bg.avif` (e.g.,
  `core_b1_bg.avif`, `space_s2_bg.avif`).
- Props/hotspots: SVG preferred (clean paths; no embedded rasters). `pack<CODE>_scene<ID>_<prop>.svg`.
- UI overlays: SVG. `ui_<scope>_<name>.svg` (e.g., `ui_codex_tabs.svg`, `ui_medal_panel.svg`).
- Badges/collectibles: SVG + 256×256 PNG fallback. `badge_<id>.svg`, `collect_<id>.svg`.
- Optional ambient loops: ≤ 200KB after brotli; provide reduced‑motion stills.
- Delivery path: `public/games/systems-discovery/assets/{core|space|ocean|bod|shared}/`.
- Budgets (post‑brotli targets): ≤ 800KB per pack total; ≤ 30KB per prop SVG; ≤ 200KB per loop.

Definition of Done (DoD)

- Backgrounds in both sizes and codecs; safe areas respected (5% margins).
- Props exported as individual SVGs; layers organized; IDs/classes removed unless needed by theming.
- Overlays readable without animation; reduced‑motion stills present for any loop.
- Annotated PNG per scene with hotspot rectangles (percent-based) and short notes.
- Names/paths per spec; budgets verified.

Core Pack — per‑scene asset templates

- Intro/Outro (title cards)
-
  - No new illustration assets required for `SD_INTRO`/`SD_OUTRO` (implemented as text-first title cards). Reuse
    existing UI styles; ensure readable heading and buttons with visible focus. Provide only palette guidance if needed.

Extensions — Space/Ocean/BOD Intro/Outro (title cards)

- Space pack: `SD_SPACE_INTRO`/`SD_SPACE_OUTRO` — text‑first title cards (no new illustration assets required). Copy
  keys under `sysdisc.space.intro.*` and `sysdisc.space.outro.*`.
- Ocean pack: `SD_OCEAN_INTRO`/`SD_OCEAN_OUTRO` — text‑first title cards. Keys: `sysdisc.ocean.intro.*` /
  `sysdisc.ocean.outro.*`.
- Body Systems sub‑packs (Breath, Fuel, Move, Signal & Defend, Grow): per‑sub‑pack intro/outro are text‑first. Keys:
  `sysdisc.bod.<sub>.intro.*` / `sysdisc.bod.<sub>.outro.*`. Follow the same accessibility guidance (H1 heading, ≥44px
  controls, visible focus) and provide reduced‑motion‑friendly designs.

- B1 Food Web at Home
    - BG: `core_b1_bg.avif` (kitchen/herb/compost corner)
    - Props: `core_b1_arrow_[1..5].svg`, `core_b1_sink.svg`, `core_b1_compost.svg`, `core_b1_herb_pot.svg`,
      `core_b1_rain_jar.svg`
    - UI: `ui_loop_slots.svg`
    - Badge/collectible: `badge_systems_scout.svg`, `collect_loop_card.svg`
- B2 Transit Rhythm
    - BG: `core_b2_bg.avif` (neighborhood map/stop)
    - Props: `core_b2_bus.svg`, `core_b2_bike.svg`, `core_b2_crosswalk.svg`, `core_b2_pin_[1..3].svg`
    - UI: `ui_route_steps.svg`
- B3 Waste Sorting
    - BG: `core_b3_bg.avif` (community bins)
    - Props: `core_b3_bin_[recycle|compost|landfill].svg`, `core_b3_item_[1..6].svg`
    - UI: `ui_sort_help.svg`

Space Pack — per‑scene asset templates

- S1 Orbits & Periods
    - BG: `space_s1_bg.avif` (abstract solar model board)
    - Props: `space_s1_planet_[1..8].svg`, `space_s1_orbit_ring_[1..3].svg`
    - UI: `ui_orbit_order.svg`
- S2 Light & Shadows
    - BG: `space_s2_bg.avif`
    - Props: `space_s2_lamp.svg`, `space_s2_ball_[1..3].svg`, `space_s2_shadow_cards_[1..4].svg`
    - UI: `ui_phase_wheel.svg`
- S3 Habitable Clues
    - BG: `space_s3_bg.avif`
    - Props: `space_s3_atmo_card_[1..6].svg`, `space_s3_icon_[pressure|temp|gas].svg`
    - UI: `ui_clue_compare.svg`

Ocean Pack — per‑scene asset templates

- O1 Layers of Light
    - BG: `ocean_o1_bg.avif` (depth gradient board)
    - Props: `ocean_o1_layer_[epi|meso|bathy|abyss|hadal].svg`, `ocean_o1_creature_[1..6].svg`
    - UI: `ui_depth_order.svg`
- O2 Currents & Climate
    - BG: `ocean_o2_bg.avif`
    - Props: `ocean_o2_arrow_[wind|current|upwelling].svg`, `ocean_o2_buoy.svg`, `ocean_o2_coast.svg`
    - UI: `ui_current_map.svg`
- O3 Deep Signals
  - BG: `ocean_o3_bg.avif`
  - Props: `ocean_o3_signal_[ping|song|light].svg`, `ocean_o3_creature_[1..4].svg`
  - UI: `ui_signal_match.svg`

Body Systems — per‑sub‑pack asset templates (BOD)

- BOD‑Breath (Respiration & Circulation)
  - BGs: `bod_breath_bb1_bg.avif`, `bod_breath_bb2_bg.avif`, `bod_breath_bb3_bg.avif`
  - Props:
    - BB1: `bod_bb1_airway.svg`, `bod_bb1_lungs.svg`, `bod_bb1_alveoli.svg`, `bod_bb1_o2_co2_cards_[1..4].svg`
    - BB2: `bod_bb2_heart_outline.svg`, `bod_bb2_chambers_[ra|rv|la|lv].svg`, `bod_bb2_flow_arrows_[1..4].svg`
    - BB3: `bod_bb3_exchange_panel.svg`, `bod_bb3_o2_icon.svg`, `bod_bb3_co2_icon.svg`
  - UI: `ui_bod_meter.svg` (Homeostasis), `ui_bod_match_slots.svg`

- BOD‑Fuel (Digest, Absorb, Excrete)
  - BGs: `bod_fuel_bf1_bg.avif`, `bod_fuel_bf2_bg.avif`, `bod_fuel_bf3_bg.avif`
  - Props:
    - BF1: `bod_bf1_food_card_[carb|protein|fat|fiber].svg`, `bod_bf1_enzyme_card_[1..3].svg`
    - BF2: `bod_bf2_villi.svg`, `bod_bf2_transport_arrow_[1..3].svg`, `bod_bf2_liver.svg`, `bod_bf2_pancreas.svg`
    - BF3: `bod_bf3_kidney.svg`, `bod_bf3_bladder.svg`, `bod_bf3_water_drop.svg`
  - UI: `ui_bod_order_strip.svg`, `ui_bod_meter.svg`

- BOD‑Move (Frame & Motion)
  - BGs: `bod_move_bm1_bg.avif`, `bod_move_bm2_bg.avif`, `bod_move_bm3_bg.avif`
  - Props:
    - BM1: `bod_bm1_bone_[humerus|radius|ulna].svg`, `bod_bm1_joint_[hinge|ball].svg`, `bod_bm1_safety_card.svg`
    - BM2: `bod_bm2_muscle_pair_[flexor|extensor].svg`, `bod_bm2_weight.svg`, `bod_bm2_timer.svg`
    - BM3: `bod_bm3_brain.svg`, `bod_bm3_nerve.svg`, `bod_bm3_signal_icon.svg`
  - UI: `ui_bod_choice_buttons.svg`

- BOD‑Signal & Defend (Sense, Signal, Protect)
  - BGs: `bod_signal_bsd1_bg.avif`, `bod_signal_bsd2_bg.avif`, `bod_signal_bsd3_bg.avif`
  - Props:
    - BSD1: `bod_bsd1_sensor_[light|sound|pressure|chemical].svg`, `bod_bsd1_path_cards_[1..4].svg`
    - BSD2: `bod_bsd2_hormone_cards_[sleep|energy|growth].svg`, `bod_bsd2_gland_[pituitary|thyroid|adrenal].svg`
    - BSD3: `bod_bsd3_skin.svg`, `bod_bsd3_barrier_cards_[1..3].svg`, `bod_bsd3_immune_cell_[1..3].svg`,
      `bod_bsd3_lymph.svg`
  - UI: `ui_bod_compare.svg`, `ui_bod_meter.svg`

- BOD‑Grow (Development & Care)
  - BGs: `bod_grow_bg1.avif`, `bod_grow_bg2.avif`, `bod_grow_bg3.avif`
  - Props:
    - BG1: `bod_bg1_cells_[gamete|zygote|embryo].svg`, `bod_bg1_growth_arrow.svg`
    - BG2: `bod_bg2_hormone_cards_[1..3].svg`, `bod_bg2_consent_icon.svg`, `bod_bg2_support_cards_[1..3].svg`
    - BG3: `bod_bg3_care_network_[family|community|clinic].svg`
  - UI: `ui_bod_wrap.svg`, `ui_bod_meter.svg`

Notes & guardrails for BOD

- All art is abstract/schematic; no realistic anatomy or gore. Reproductive content uses neutral icons and emphasizes
  consent, care, and science.
- Keep budgets identical to other packs; prefer SVG props; reuse `ui_bod_meter.svg` across sub‑packs.

Hand‑off workflow

1) Deliver backgrounds (2 sizes, AVIF+WEBP), props SVGs, optional loops + stills, annotated PNG per scene, palette
   notes.
2) We integrate and share a short capture. We aim for ≤2 iteration cycles.
3) PR checklist (paste):

- [ ] Backgrounds (2560×1440 + 1920×1080) AVIF + WEBP
- [ ] Props SVGs (clean paths; separate hotspot layers)
- [ ] Badge/collectibles
- [ ] Optional loops + reduced‑motion stills
- [ ] Annotated PNG with hotspot rectangles/notes
- [ ] Names/paths per spec; budgets verified
- [ ] Linked to stories entry; status updated

— — —

# Systems Discovery — Cahier Designer/Animateur·rice (FR)

Ce cahier décrit les livrables visuels/motion pour « Systems Discovery ». Il reprend la structure de Rite of Discovery :
formats, tailles, nommage, budgets et checklist de remise pour une intégration fluide.

Liens

- Doc de conception : docs/systems-discovery/systems-discovery-design.md
- Suivi des histoires : docs/systems-discovery/systems-discovery-stories.md

Principes clés

- Bienveillance; curiosité optimiste; pas d’alarmisme. Pas de marques/logos réels.
- Accessibilité : hotspots visibles, contraste élevé, alternatives sans animation, sous‑titres pour SFX/ambiances.
- Performance : privilégier SVG et AVIF; respecter les budgets.

Formats, tailles, nommage, livraison

- Arrières‑plans : AVIF + WEBP; 2560×1440 et 1920×1080. `pack<CODE>_scene<ID>_bg.avif`.
- Props/hotspots : SVG (chemins propres). `pack<CODE>_scene<ID>_<prop>.svg`.
- Overlays UI : SVG. `ui_<scope>_<nom>.svg`.
- Badges/collectors : SVG + PNG 256×256 secours.
- Boucles audio/visuelles (optionnel) : ≤ 200KB; statiques fournies.
- Dossier : `public/games/systems-discovery/assets/{core|space|ocean|shared}/`.
- Dossier : `public/games/systems-discovery/assets/{core|space|ocean|bod|shared}/`.
- Budgets : ≤ 800KB par pack; ≤ 30KB/SVG; ≤ 200KB/boucle.

Définition de Fini (DoD)

- BGs en 2 tailles/codecs; marges de sécurité 5%.
- Props SVG individuels; calques propres; IDs/classes supprimés sauf thème.
- Overlays lisibles sans animation; alternatives motion réduite.
- PNG annoté (rectangles % + notes).
- Noms/chemins conformes; budgets OK.

Gabarits d’assets par scène — Core, Space, Ocean

- Identiques à la section EN ci‑dessus (BG, props, overlays, badge/collector).

Corps humain — Sous‑packs (BOD)

- BOD‑Breath (Respirer & Circuler)
  - BGs: `bod_breath_bb1_bg.avif`, `bod_breath_bb2_bg.avif`, `bod_breath_bb3_bg.avif`
  - Props: voies aériennes, poumons, alvéoles, icônes O2/CO2; cœur (schématique), flèches de flux.
  - UI: `ui_bod_meter.svg`, `ui_bod_match_slots.svg`.

- BOD‑Fuel (Digérer, Absorber, Éliminer)
  - BGs: `bod_fuel_bf1_bg.avif`, `bod_fuel_bf2_bg.avif`, `bod_fuel_bf3_bg.avif`
  - Props: cartes aliments/enzymes (génériques), villosités, foie/pancréas, rein/vessie, goutte d’eau.
  - UI: `ui_bod_order_strip.svg`, `ui_bod_meter.svg`.

- BOD‑Move (Charpente & Mouvement)
  - BGs: `bod_move_bm1_bg.avif`, `bod_move_bm2_bg.avif`, `bod_move_bm3_bg.avif`
  - Props: os/joints (schématiques), paires musculaires, cerveau/nerfs (icônes).
  - UI: `ui_bod_choice_buttons.svg`.

- BOD‑Signal & Defend (Percevoir, Signaler, Protéger)
  - BGs: `bod_signal_bsd1_bg.avif`, `bod_signal_bsd2_bg.avif`, `bod_signal_bsd3_bg.avif`
  - Props: capteurs (lumière/son/pression/chimique), cartes hormones, peau/barrières, cellules immunitaires, lymphe.
  - UI: `ui_bod_compare.svg`, `ui_bod_meter.svg`.

- BOD‑Grow (Développement & Soin)
  - BGs: `bod_grow_bg1.avif`, `bod_grow_bg2.avif`, `bod_grow_bg3.avif`
  - Props: cellules (gamète/zygote/embryon) schématiques, icône consentement, cartes de soutien.
  - UI: `ui_bod_wrap.svg`, `ui_bod_meter.svg`.

Garde‑fous (BOD)

- Iconographie abstraite; pas d’images réalistes. Contenus reproductifs: ton scientifique, consentement, soin.

Flux de remise (PR)

1) Livraison des BGs, props, boucles optionnelles + statiques, PNG annoté, notes de palette.
2) Intégration + capture courte; viser ≤2 itérations.
3) Checklist PR (copier/coller) : identique à la section EN.
