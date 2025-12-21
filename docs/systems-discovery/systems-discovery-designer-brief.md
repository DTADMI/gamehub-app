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
- Delivery path: `public/games/systems-discovery/assets/{core|space|ocean|shared}/`.
- Budgets (post‑brotli targets): ≤ 800KB per pack total; ≤ 30KB per prop SVG; ≤ 200KB per loop.

Definition of Done (DoD)

- Backgrounds in both sizes and codecs; safe areas respected (5% margins).
- Props exported as individual SVGs; layers organized; IDs/classes removed unless needed by theming.
- Overlays readable without animation; reduced‑motion stills present for any loop.
- Annotated PNG per scene with hotspot rectangles (percent-based) and short notes.
- Names/paths per spec; budgets verified.

Core Pack — per‑scene asset templates

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
- Budgets : ≤ 800KB par pack; ≤ 30KB/SVG; ≤ 200KB/boucle.

Définition de Fini (DoD)

- BGs en 2 tailles/codecs; marges de sécurité 5%.
- Props SVG individuels; calques propres; IDs/classes supprimés sauf thème.
- Overlays lisibles sans animation; alternatives motion réduite.
- PNG annoté (rectangles % + notes).
- Noms/chemins conformes; budgets OK.

Gabarits d’assets par scène — Core, Space, Ocean

- Identiques à la section EN ci‑dessus (BG, props, overlays, badge/collector).

Flux de remise (PR)

1) Livraison des BGs, props, boucles optionnelles + statiques, PNG annoté, notes de palette.
2) Intégration + capture courte; viser ≤2 itérations.
3) Checklist PR (copier/coller) : identique à la section EN.
