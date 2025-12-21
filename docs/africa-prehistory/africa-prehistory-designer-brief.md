# Africa Prehistory — Paths of Many (Designer/Animator Brief)

Related docs

- Design Doc: docs/africa-prehistory/africa-prehistory-design.md
- Stories Tracker: docs/africa-prehistory/africa-prehistory-stories.md

Principles

- Community‑centered, regionally diverse, non‑monolithic portrayal.
- Truthful about harms/oppressions; non‑graphic, contextualized; content notes via captions.
- Accessibility by default: captions for SFX/music, reduced‑motion stills, high‑contrast variants, 44px targets.
- Performance: SVG for props/UI; AVIF stills; reuse sprites.

Delivery paths

- assets/afp/{ss|fr|rh|gl|cc|shared}/...
    - ss = Sahara & Sahel Pathways
    - fr = Forests & Rivers — Congo/Niger
    - rh = Rift & Horn
    - gl = Great Lakes & Highlands
    - cc = Coasts & Crossings — Atlantic/Indian

Formats & naming

- Backgrounds AVIF 1920×1080: `bg_<pack>_<scene>.avif`
- Props SVG: `prop_<pack>_<scene>_<name>.svg`
- UI SVG: `ui_<pack>_<name>.svg`; shared: `ui_shared_*`
- Badges/collectibles: `collect_<pack>_badge.svg`, `collect_afp_scout.svg`
- Audio + captions: `aud_<pack>_<scene>_<cue>.ogg|mp3` + `*.vtt`
- Reduced‑motion stills: `*_still.avif`

Definition of Done (DoD)

- Files in correct folders, correct naming, alt text + captions provided.
- Color contrast AA/AAA where possible; dark/light variants as needed.
- Reduced‑motion stills for any animated element.
- PR includes previews (PNG), checklist, and links to story entry.

Pack asset templates (per pack: 3 scenes + wrap)

Sahara & Sahel Pathways (ss)

- BG: `bg_ss_1.avif`, `bg_ss_2.avif`, `bg_ss_3.avif`, `bg_ss_wrap.avif`
- Props: `prop_ss_1_oasis_ledger.svg`, `prop_ss_2_furnace_parts.svg`, `prop_ss_3_star_chart.svg`
- UI: `ui_ss_meter.svg` (Community Web segment), `ui_ss_hint.svg`
- Badge: `collect_ss_badge.svg`

Forests & Rivers — Congo/Niger (fr)

- BG: `bg_fr_1.avif`, `bg_fr_2.avif`, `bg_fr_3.avif`, `bg_fr_wrap.avif`
- Props: `prop_fr_1_trade_bundles.svg`, `prop_fr_2_forest_icons.svg`, `prop_fr_3_mancala_board.svg`
- UI: `ui_fr_routes.svg`
- Badge: `collect_fr_badge.svg`

Rift & Horn (rh)

- BG: `bg_rh_1.avif`, `bg_rh_2.avif`, `bg_rh_3.avif`, `bg_rh_wrap.avif`
- Props: `prop_rh_1_terrace_modules.svg`, `prop_rh_2_monsoon_calendar.svg`, `prop_rh_3_script_tiles.svg`
- UI: `ui_rh_flow.svg`
- Badge: `collect_rh_badge.svg`

Great Lakes & Highlands (gl)

- BG: `bg_gl_1.avif`, `bg_gl_2.avif`, `bg_gl_3.avif`, `bg_gl_wrap.avif`
- Props: `prop_gl_1_commons_tokens.svg`, `prop_gl_2_tools_garden.svg`, `prop_gl_3_court_icons.svg`
- UI: `ui_gl_trust.svg`
- Badge: `collect_gl_badge.svg`

Coasts & Crossings — Atlantic/Indian (cc)

- BG: `bg_cc_1.avif`, `bg_cc_2.avif`, `bg_cc_3.avif`, `bg_cc_wrap.avif`
- Props: `prop_cc_1_currents_map.svg`, `prop_cc_2_market_tiles.svg`, `prop_cc_3_tide_clock.svg`
- UI: `ui_cc_routes.svg`
- Badge: `collect_cc_badge.svg`

Global UI & shared

- `ui_shared_choice_btn.svg`, `ui_shared_panel.svg`, `ui_shared_meter.svg`
- `collect_afp_scout.svg`

Hand‑off workflow & PR checklist

- Attach PNG previews; list assets; include alt text and captions; report contrast results.
- Link Stories entry; tick Accessibility (captions, reduced‑motion) completed.

— — —

# FR — Afrique Préhistoire — Les chemins pluriels (Brief Créa)

Principes

- Représentation non monolithique, centrée sur les communautés.
- Vérité sur les violences/oppressions, sans visuels choquants; notes de contexte via légendes.
- Accessibilité: sous‑titres, alternatives statiques, variantes à fort contraste, cibles 44px.

Livrables, formats, chemins

- Identiques à la section EN; chemins: `assets/afp/{ss|fr|rh|gl|cc|shared}/...`

Définition de fini

- Nommage correct, alt text, sous‑titres, alternatives statiques; préviews PNG et checklist en PR.

Templates d’actifs par pack

- Identiques à la section EN (BG, Props, UI, Badge, Wrap) pour ss, fr, rh, gl, cc.

Workflow PR

- Lien vers la fiche d’histoire; vérifications d’accessibilité cochées.
