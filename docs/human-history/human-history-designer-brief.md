# Human History — Many Hands Make History (Designer/Animator Brief)

This brief defines deliverables, formats, naming, accessibility, budgets, and hand‑off workflow for the Human History
point‑and‑click game. It mirrors the structure used in our other games and must be used for all art/audio/UI submitted
to the repo.

Related docs

- Design Doc: docs/human-history/human-history-design.md
- Stories Tracker: docs/human-history/human-history-stories.md

Principles

- Kindness first, truthful and respectful: portray communities and structures behind change; acknowledge harm and
  oppression without graphic depiction.
- Accessibility by default: readable type, high-contrast variants, captions for SFX/music, reduced‑motion stills for all
  sequences.
- Performance: lightweight vectors (SVG) and optimized stills (AVIF/PNG), sprite reuse across scenes.
- Cultural neutrality and care: abstract/schematic visuals; when referencing real cultures, prefer representative
  artifacts/patterns without caricature. Include alt text and context captions.

Delivery paths

- assets/hh/{core|origins|rivers|trade|safety|modern|shared}/...
    - Pack slugs:
        - origins → Origins of Cooperation
        - rivers → River Civilizations Across Continents
        - trade → Trade & Ideas on the Move
        - safety → Everyday Safety & Care
        - modern → Modern Social Nets
        - shared → common UI and stickers

File formats & sizes

- Backgrounds: AVIF primary, PNG fallback, 1920×1080; provide `@1x` base and scalable vector overlays when feasible.
- Props/Icons: SVG preferred; raster only if texture‑dependent (export 1×/2× PNGs if raster).
- UI: SVG for icons; 9‑slice friendly panels; ensure minimum 44 px touch targets.
- Audio: OGG/MP3 (stereo), normalized; provide caption text in a `.vtt` or `.md` snippet.
- Motion: Prefer CSS/JS lightweight tweens. Always provide a reduced‑motion still in the same folder using
  `*_still.avif`.

Naming conventions

- Backgrounds: `bg_<pack>_<scene>.avif`
- Props: `prop_<pack>_<scene>_<name>.svg`
- UI: `ui_<pack>_<name>.svg` (shared UI uses `ui_shared_*`)
- Stickers/Badges: `collect_<pack>_badge.svg`, `collect_hh_scout.svg`
- Captions: `aud_<pack>_<scene>_<cue>.vtt` + a short `.md` note for context

Definition of Done (DoD)

- Files in correct folders, named per convention, include alt text/captions.
- Color contrast AA large text / AAA normal where feasible; dark/light variants where needed.
- Reduced‑motion stills included for any animated element.
- Export checklist completed in PR description; preview screenshots (PNG) added.
- License/attribution notes attached if any third‑party assets were used (prefer original work).

Pack asset templates (per pack, 3 scenes + wrap)

1) Origins of Cooperation (`origins`)

- Scenes: O1 Savannah Signals, O2 Shore Exchange, O3 Painted Memory, Wrap
- Backgrounds: `bg_origins_o1.avif`, `bg_origins_o2.avif`, `bg_origins_o3.avif`, `bg_origins_wrap.avif`
- Props (examples): `prop_origins_o1_fire_signals.svg`, `prop_origins_o2_shell_tokens.svg`,
  `prop_origins_o3_ochre_pigment.svg`
- UI: `ui_origins_meter.svg` (Community Web meter), `ui_origins_hint.svg`
- Badge: `collect_origins_badge.svg`

2) River Civilizations Across Continents (`rivers`)

- Scenes: R1 Nile Granary, R2 Indus Town Plan, R3 Yellow River Dykes, Wrap
- Backgrounds: `bg_rivers_r1.avif`, `bg_rivers_r2.avif`, `bg_rivers_r3.avif`, `bg_rivers_wrap.avif`
- Props: `prop_rivers_r1_granary_bins.svg`, `prop_rivers_r2_street_grid.svg`, `prop_rivers_r3_dyke_modules.svg`
- UI: `ui_rivers_flow.svg`
- Badge: `collect_rivers_badge.svg`

3) Trade & Ideas on the Move (`trade`)

- Scenes: T1 Indian Ocean Dhows, T2 Silk Roads Caravanserai, T3 Trans‑Saharan Caravans, Wrap
- Backgrounds: `bg_trade_t1.avif`, `bg_trade_t2.avif`, `bg_trade_t3.avif`, `bg_trade_wrap.avif`
- Props: `prop_trade_t1_star_chart.svg`, `prop_trade_t2_waystation_tiles.svg`, `prop_trade_t3_salt_ledger.svg`
- UI: `ui_trade_routes.svg`
- Badge: `collect_trade_badge.svg`

4) Everyday Safety & Care (`safety`)

- Scenes: S1 Fire Codes & Watch, S2 Well & Qanat Coop, S3 Guild Mutual Aid, Wrap
- Backgrounds: `bg_safety_s1.avif`, `bg_safety_s2.avif`, `bg_safety_s3.avif`, `bg_safety_wrap.avif`
- Props: `prop_safety_s1_bucket_chain.svg`, `prop_safety_s2_qanat_section.svg`, `prop_safety_s3_aid_chest.svg`
- UI: `ui_safety_trust.svg`
- Badge: `collect_safety_badge.svg`

5) Modern Social Nets (`modern`)

- Scenes: M1 Public Health Drives, M2 Labor Safety Standards, M3 Disaster Mutual Aid, Wrap
- Backgrounds: `bg_modern_m1.avif`, `bg_modern_m2.avif`, `bg_modern_m3.avif`, `bg_modern_wrap.avif`
- Props: `prop_modern_m1_posters.svg`, `prop_modern_m2_hardhat.svg`, `prop_modern_m3_network_map.svg`
- UI: `ui_modern_actions.svg`
- Badge: `collect_modern_badge.svg`

Global UI & shared

- `ui_shared_choice_btn.svg`, `ui_shared_panel.svg`, `ui_shared_badge_slot.svg`
- `collect_hh_scout.svg` (overall track sticker)

Tone & sensitivity notes

- Show systems and people working together. Avoid “great man” framing; when mentioning a well‑known figure, add
  surrounding context (institutions, communities, conditions).
- Truthful where harm/violence happened; keep visuals non‑graphic, abstracted, and respectful. Provide content notes in
  captions when relevant.

Hand‑off workflow & PR checklist

- For each scene: attach PNG previews, list of SVG/AVIF files, captions, alt texts, color contrast check result.
- Link the corresponding story entry in Stories Tracker and tick reviewed fields.
- Include `Reduced‑motion: provided` and `Captions: provided` statements.

— — —

# FR — Human History — Les petites mains font l’Histoire (Brief Créa)

Principes

- Bienveillance, vérité et respect: montrer les communautés et structures; reconnaître les violences/oppressions sans
  visuels choquants.
- Accessibilité par défaut: lisibilité, contraste élevé, sous‑titres des sons/musiques, alternatives statiques pour les
  animations.
- Performance: SVG légers, AVIF optimisés, réutilisation d’éléments.
- Soin culturel: visuels schématiques/abstraits, sans caricature; fournir textes alternatifs et légendes.

Livrables & formats

- Fonds: AVIF 1920×1080; Props: SVG; UI: SVG; Audio: OGG/MP3 + sous‑titres VTT.
- Conventions de nommage identiques (voir section EN).

Chemins de livraison

- `assets/hh/{origins|rivers|trade|safety|modern|shared}/...`

Définition de fini (DoD)

- Fichiers nommés correctement, alt text et sous‑titres inclus; variantes à contraste élevé; alternatives statiques pour
  les animations.

Templates d’actifs par pack

- Identiques à la section EN (O1–O3, R1–R3, T1–T3, S1–S3, M1–M3 + wrap + badge).

Workflow PR

- Préviews PNG, liste des fichiers, sous‑titres/alt text, vérification de contraste, lien vers la fiche d’histoire
  correspondante.
